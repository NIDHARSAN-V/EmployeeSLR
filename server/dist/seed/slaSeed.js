"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const mongoose_1 = __importDefault(require("mongoose"));
const user_model_1 = require("../models/user.model");
const resource_model_1 = require("../models/resource.model");
const BASE_URL = process.env.SEED_BASE_URL || "http://127.0.0.1:8000";
const MONGO_URL = process.env.MONGO_URL ||
    process.env.MONGO_URI ||
    "mongodb://127.0.0.1:27017/helpdesk_demo";
const PASSWORD = "Pass@1234";
const ACCEPT_SLA_MIN = Number(process.env.ACCEPT_SLA_MIN ?? 2);
const COMPLETE_SLA_MIN = Number(process.env.COMPLETE_SLA_MIN ?? 2);
const NEAR_DUE_MIN = Number(process.env.NEAR_DUE_MIN ?? 1);
const minMs = (m) => m * 60 * 1000;
async function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}
async function http(path, method = "GET", body) {
    const res = await fetch(`${BASE_URL}${path}`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    let json = null;
    try {
        json = text ? JSON.parse(text) : null;
    }
    catch {
        json = { raw: text };
    }
    if (!res.ok) {
        throw new Error(`HTTP ${res.status} ${method} ${path} -> ${JSON.stringify(json)}`);
    }
    return json;
}
async function pingServer() {
    const res = await fetch(`${BASE_URL}/`).catch(() => null);
    if (!res)
        throw new Error("Backend not running");
}
async function clearDatabase() {
    await Promise.all([
        user_model_1.User.deleteMany({}),
        resource_model_1.Ticket.deleteMany({}),
        resource_model_1.Asset.deleteMany({}),
        resource_model_1.WorkEvent.deleteMany({}),
        resource_model_1.WorkEventActor.deleteMany({}),
        resource_model_1.Discussion.deleteMany({}),
        resource_model_1.SlaAcceptBreach.deleteMany({}),
        resource_model_1.SlaCompleteBreach.deleteMany({}),
    ]);
}
async function registerAndLogin(userName, email, role) {
    await http("/auth/register", "POST", {
        userName,
        email,
        password: PASSWORD,
        role,
    });
    const login = await http("/auth/login", "POST", {
        email,
        password: PASSWORD,
    });
    return login.user.id;
}
async function seed() {
    await mongoose_1.default.connect(MONGO_URL);
    await pingServer();
    await clearDatabase();
    console.log("Creating users...");
    const adminId = await registerAndLogin("Admin Demo", "admin@test.com", "ADMIN");
    const resolver1Id = await registerAndLogin("Resolver1", "resolver1@test.com", "RESOLVER");
    const resolver2Id = await registerAndLogin("Resolver2", "resolver2@test.com", "RESOLVER");
    const employeeIds = [];
    for (let i = 1; i <= 6; i++) {
        const id = await registerAndLogin(`Employee ${i}`, `employee${i}@test.com`, "EMPLOYEE");
        employeeIds.push(id);
    }
    console.log("Users created");
    const ticketIds = [];
    const assetIds = [];
    const TICKET_TYPES = [
        "Laptop Issue",
        "Printer Offline",
        "Network Issue",
        "VPN Issue",
        "System Crash",
        "Password Reset",
    ];
    const ASSET_TYPES = [
        "Laptop Request",
        "Monitor Request",
        "Keyboard Request",
        "RAM Upgrade",
    ];
    console.log("Creating tickets");
    for (let i = 0; i < 18; i++) {
        const raisedBy = employeeIds[i % employeeIds.length];
        const created = await http("/tickets", "POST", {
            request_type: TICKET_TYPES[i % TICKET_TYPES.length],
            raised_by: raisedBy,
        });
        const ticketId = String(created.refId);
        ticketIds.push(ticketId);
        if (i >= 6) {
            const resolver = i % 2 === 0 ? resolver1Id : resolver2Id;
            await http(`/tickets/${ticketId}/accept`, "POST", {
                accepted_by: resolver,
            });
        }
        if (i >= 12) {
            const resolver = i % 2 === 0 ? resolver1Id : resolver2Id;
            await http(`/tickets/${ticketId}/complete`, "POST", {
                completed_by: resolver,
            });
        }
    }
    console.log("Tickets created");
    console.log("Creating assets");
    for (let i = 0; i < 12; i++) {
        const raisedBy = employeeIds[(i + 2) % employeeIds.length];
        const created = await http("/assets", "POST", {
            request_type: ASSET_TYPES[i % ASSET_TYPES.length],
            raised_by: raisedBy,
        });
        const assetId = String(created.refId);
        assetIds.push(assetId);
        if (i >= 4) {
            const resolver = i % 2 === 0 ? resolver1Id : resolver2Id;
            await http(`/assets/${assetId}/accept`, "POST", {
                accepted_by: resolver,
            });
        }
        if (i >= 8) {
            const resolver = i % 2 === 0 ? resolver1Id : resolver2Id;
            await http(`/assets/${assetId}/complete`, "POST", {
                completed_by: resolver,
            });
        }
    }
    console.log("Assets created");
    console.log("Adding discussion messages");
    for (let i = 0; i < 6; i++) {
        await http(`/discussion/ticket/${ticketIds[i]}/message`, "POST", {
            userId: employeeIds[i % employeeIds.length],
            message: `Employee message ${i}`,
        });
        await http(`/discussion/ticket/${ticketIds[i]}/message`, "POST", {
            userId: resolver1Id,
            message: `Resolver response ${i}`,
        });
    }
    for (let i = 0; i < 4; i++) {
        await http(`/discussion/asset/${assetIds[i]}/message`, "POST", {
            userId: employeeIds[i % employeeIds.length],
            message: `Asset request discussion ${i}`,
        });
    }
    console.log("Discussion messages added");
    console.log("Tuning SLA times");
    const now = new Date();
    const ACCEPT_SLA = minMs(ACCEPT_SLA_MIN);
    const COMPLETE_SLA = minMs(COMPLETE_SLA_MIN);
    const NEAR_WINDOW = minMs(NEAR_DUE_MIN);
    const near = NEAR_WINDOW / 2;
    const overdue = NEAR_WINDOW / 2;
    // pending tickets (accept SLA)
    for (let i = 0; i < 6; i++) {
        const refId = new mongoose_1.default.Types.ObjectId(ticketIds[i]);
        await resource_model_1.WorkEvent.updateOne({ kind: "ticket", refId, eventType: "CREATED" }, {
            $set: {
                occurredAt: new Date(now.getTime() - ACCEPT_SLA),
                dueAt: i < 3
                    ? new Date(now.getTime() - overdue)
                    : new Date(now.getTime() + near),
            },
        });
    }
    // accepted tickets (complete SLA)
    for (let i = 6; i < 12; i++) {
        const refId = new mongoose_1.default.Types.ObjectId(ticketIds[i]);
        await resource_model_1.WorkEvent.updateOne({ kind: "ticket", refId, eventType: "ACCEPTED" }, {
            $set: {
                occurredAt: new Date(now.getTime() - COMPLETE_SLA),
                dueAt: i < 9
                    ? new Date(now.getTime() - overdue)
                    : new Date(now.getTime() + near),
            },
        });
    }
    // pending assets
    for (let i = 0; i < 4; i++) {
        const refId = new mongoose_1.default.Types.ObjectId(assetIds[i]);
        await resource_model_1.WorkEvent.updateOne({ kind: "asset", refId, eventType: "CREATED" }, {
            $set: {
                occurredAt: new Date(now.getTime() - ACCEPT_SLA),
                dueAt: i < 2
                    ? new Date(now.getTime() - overdue)
                    : new Date(now.getTime() + near),
            },
        });
    }
    // accepted assets
    for (let i = 4; i < 8; i++) {
        const refId = new mongoose_1.default.Types.ObjectId(assetIds[i]);
        await resource_model_1.WorkEvent.updateOne({ kind: "asset", refId, eventType: "ACCEPTED" }, {
            $set: {
                occurredAt: new Date(now.getTime() - COMPLETE_SLA),
                dueAt: i < 6
                    ? new Date(now.getTime() - overdue)
                    : new Date(now.getTime() + near),
            },
        });
    }
    await sleep(1500);
    console.log("Fetching notifications");
    const adminDeadline = await http(`/notifications/deadline/${adminId}`);
    console.log("NEAR", adminDeadline);
    const adminEnded = await http(`/notifications/ended/${adminId}`);
    console.log("OVERDUE", adminEnded);
    console.log("Seed complete");
    await mongoose_1.default.disconnect();
    process.exit(0);
}
seed().catch((err) => {
    console.error(err);
    process.exit(1);
});
