import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { User } from "../models/user.model";

// IMPORTANT: adjust this import path to your actual file name
// Must export: Ticket, Asset, WorkEvent, WorkEventActor, Discussion, SlaAcceptBreach, SlaCompleteBreach
import {
  Ticket,
  Asset,
  WorkEvent,
  WorkEventActor,
  Discussion,
  SlaAcceptBreach,
  SlaCompleteBreach,
} from "../models/resource.model";

const BASE_URL = process.env.SEED_BASE_URL || "http://127.0.0.1:8000";
const MONGO_URL =
  process.env.MONGO_URL ||
  process.env.MONGO_URI ||
  "mongodb://127.0.0.1:27017/helpdesk_demo";

const PASSWORD = "Pass@1234";

// -----------------------------
// Helpers
// -----------------------------
const minMs = (m: number) => m * 60 * 1000;

async function http<T>(
  path: string,
  method: "GET" | "POST" = "GET",
  body?: any
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text };
  }

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${method} ${path} -> ${JSON.stringify(json)}`);
  }

  return json as T;
}

async function pingServer() {
  try {
    const res = await fetch(`${BASE_URL}/`, { method: "GET" });
    console.log(`✅ Server reachable at ${BASE_URL} (status: ${res.status})`);
  } catch (e: any) {
    throw new Error(`❌ Cannot reach server at ${BASE_URL}. Start backend first. ${e?.message || e}`);
  }
}

// -----------------------------
// 1) Clear DB every run
// -----------------------------
async function clearDatabase() {
  console.log("🧹 Clearing existing data...");

  await Promise.all([
    // users
    User.deleteMany({}),

    // core entities
    Ticket.deleteMany({}),
    Asset.deleteMany({}),

    // event store
    WorkEvent.deleteMany({}),
    WorkEventActor.deleteMany({}),

    // discussion + sla breach
    Discussion.deleteMany({}),
    SlaAcceptBreach.deleteMany({}),
    SlaCompleteBreach.deleteMany({}),
  ]);

  console.log("✅ All collections cleared");
}

// -----------------------------
// 2) Register & login via routes (so your auth logic is used)
// -----------------------------
async function registerAndLogin(userName: string, email: string, role: string) {
  await http("/auth/register", "POST", {
    userName,
    email,
    password: PASSWORD,
    role,
  });

  const login = await http<any>("/auth/login", "POST", { email, password: PASSWORD });
  return login.user.id as string;
}

// -----------------------------
// Main seed
// -----------------------------
async function seed() {
  console.log("Connecting DB...");
  await mongoose.connect(MONGO_URL);

  await pingServer();
  await clearDatabase();

  // -----------------------------
  // Create Users
  // -----------------------------
  console.log("Creating Users...");

  const adminId = await registerAndLogin("Admin Demo", "admin@test.com", "ADMIN");
  const resolver1Id = await registerAndLogin("Resolver 1", "resolver1@test.com", "RESOLVER");
  const resolver2Id = await registerAndLogin("Resolver 2", "resolver2@test.com", "RESOLVER");

  const employeeIds: string[] = [];
  for (let i = 1; i <= 6; i++) {
    const id = await registerAndLogin(`Employee ${i}`, `employee${i}@test.com`, "EMPLOYEE");
    employeeIds.push(id);
  }

  console.log("✅ Users created");

  // -----------------------------
  // Create Tickets & Assets with all states
  // -----------------------------
  const TICKET_TYPES = [
    "Laptop Not Working",
    "Printer Offline",
    "Network Connectivity Issue",
    "VPN Not Connecting",
    "System Crash",
    "Password Reset",
    "Email Access Problem",
    "Software Installation Request",
  ];

  const ASSET_TYPES = [
    "New Laptop Request",
    "Monitor Request",
    "Keyboard Replacement",
    "Mouse Replacement",
    "RAM Upgrade",
    "Docking Station Request",
  ];

  // We will create:
  // Tickets: 18 total -> 6 pending, 6 accepted-only, 6 completed
  // Assets: 12 total -> 4 pending, 4 accepted-only, 4 completed

  console.log("Creating Tickets...");
  const ticketIds: string[] = [];

  for (let i = 0; i < 18; i++) {
    const raisedBy = employeeIds[i % employeeIds.length];
    const reqType = TICKET_TYPES[i % TICKET_TYPES.length];

    const created = await http<any>("/tickets", "POST", {
      request_type: reqType,
      raised_by: raisedBy,
    });

    const ticketId = String(created.refId);
    ticketIds.push(ticketId);

    // Accepted-only
    if (i >= 6) {
      const resolver = i % 2 === 0 ? resolver1Id : resolver2Id;
      await http(`/tickets/${ticketId}/accept`, "POST", { accepted_by: resolver });
    }

    // Completed
    if (i >= 12) {
      const resolver = i % 2 === 0 ? resolver1Id : resolver2Id;
      await http(`/tickets/${ticketId}/complete`, "POST", { completed_by: resolver });
    }
  }

  console.log("✅ Tickets created:", ticketIds.length);

  console.log("Creating Assets...");
  const assetIds: string[] = [];

  for (let i = 0; i < 12; i++) {
    const raisedBy = employeeIds[(i + 2) % employeeIds.length];
    const reqType = ASSET_TYPES[i % ASSET_TYPES.length];

    const created = await http<any>("/assets", "POST", {
      request_type: reqType,
      raised_by: raisedBy,
    });

    const assetId = String(created.refId);
    assetIds.push(assetId);

    // Accepted-only
    if (i >= 4) {
      const resolver = i % 2 === 0 ? resolver1Id : resolver2Id;
      await http(`/assets/${assetId}/accept`, "POST", { accepted_by: resolver });
    }

    // Completed
    if (i >= 8) {
      const resolver = i % 2 === 0 ? resolver1Id : resolver2Id;
      await http(`/assets/${assetId}/complete`, "POST", { completed_by: resolver });
    }
  }

  console.log("✅ Assets created:", assetIds.length);

  // -----------------------------
  // Add Discussion Messages (ticket + asset)
  // -----------------------------
  console.log("Adding discussion messages...");

  // 2 messages on some tickets
  for (let i = 0; i < 5; i++) {
    const tId = ticketIds[i];
    const userId = employeeIds[i % employeeIds.length];

    await http(`/discussion/ticket/${tId}/message`, "POST", {
      userId,
      message: `Employee message ${i + 1} for ticket ${tId}`,
    });

    await http(`/discussion/ticket/${tId}/message`, "POST", {
      userId: resolver1Id,
      message: `Resolver reply ${i + 1} for ticket ${tId}`,
    });
  }

  // 1 message on some assets
  for (let i = 0; i < 3; i++) {
    const aId = assetIds[i];
    const userId = employeeIds[(i + 1) % employeeIds.length];

    await http(`/discussion/asset/${aId}/message`, "POST", {
      userId,
      message: `Employee message ${i + 1} for asset ${aId}`,
    });
  }

  console.log("✅ Discussion messages added");

  // -----------------------------
  // Tune due times to demo Notifications
  // - Some CREATED dueAt near deadline (accept)
  // - Some CREATED dueAt overdue (accept breach)
  // - Some ACCEPTED dueAt near deadline (complete)
  // - Some ACCEPTED dueAt overdue (complete breach)
  //
  // IMPORTANT: SLA breach DB is populated ONLY when /notifications/ended/:userId is called,
  // because you requested that.
  // -----------------------------
  console.log("Tuning due times for notification demo...");

  const now = new Date();

  // Tickets pending (0..5): tune CREATED dueAt
  // first 3 overdue, next 3 near deadline
  for (let i = 0; i < 6; i++) {
    const refId = new mongoose.Types.ObjectId(ticketIds[i]);
    await WorkEvent.updateOne(
      { kind: "ticket", refId, eventType: "CREATED" },
      {
        $set: {
          occurredAt: new Date(now.getTime() - minMs(10)),
          dueAt: i < 3 ? new Date(now.getTime() - minMs(2)) : new Date(now.getTime() + minMs(1)),
        },
      }
    );
  }

  // Tickets accepted-only (6..11): tune ACCEPTED dueAt
  // first 3 overdue completion, next 3 near completion
  for (let i = 6; i < 12; i++) {
    const refId = new mongoose.Types.ObjectId(ticketIds[i]);
    await WorkEvent.updateOne(
      { kind: "ticket", refId, eventType: "ACCEPTED" },
      {
        $set: {
          occurredAt: new Date(now.getTime() - minMs(8)),
          dueAt: i < 9 ? new Date(now.getTime() - minMs(2)) : new Date(now.getTime() + minMs(1)),
        },
      }
    );
  }

  // Assets pending (0..3): tune CREATED dueAt (2 overdue, 2 near)
  for (let i = 0; i < 4; i++) {
    const refId = new mongoose.Types.ObjectId(assetIds[i]);
    await WorkEvent.updateOne(
      { kind: "asset", refId, eventType: "CREATED" },
      {
        $set: {
          occurredAt: new Date(now.getTime() - minMs(12)),
          dueAt: i < 2 ? new Date(now.getTime() - minMs(2)) : new Date(now.getTime() + minMs(1)),
        },
      }
    );
  }

  // Assets accepted-only (4..7): tune ACCEPTED dueAt (2 overdue, 2 near)
  for (let i = 4; i < 8; i++) {
    const refId = new mongoose.Types.ObjectId(assetIds[i]);
    await WorkEvent.updateOne(
      { kind: "asset", refId, eventType: "ACCEPTED" },
      {
        $set: {
          occurredAt: new Date(now.getTime() - minMs(7)),
          dueAt: i < 6 ? new Date(now.getTime() - minMs(2)) : new Date(now.getTime() + minMs(1)),
        },
      }
    );
  }

  console.log("✅ Due times tuned");

  // -----------------------------
  // Trigger SLA breach population by calling notification ended endpoints
  // (Because breaches are inserted ONLY from notificationForTimeEnded)
  // -----------------------------
  console.log("Triggering SLA breach insertion via notifications ended...");

  await http(`/notifications/ended/${adminId}`, "GET");
  await http(`/notifications/ended/${resolver1Id}`, "GET");
  await http(`/notifications/ended/${resolver2Id}`, "GET");

  console.log("✅ SLA breach DB populated (via ended notifications)");

  // -----------------------------
  // Print demo cheat sheet
  // -----------------------------
  const sampleTicketPending = ticketIds[0];
  const sampleTicketAccepted = ticketIds[6];
  const sampleTicketCompleted = ticketIds[12];

  const sampleAssetPending = assetIds[0];
  const sampleAssetAccepted = assetIds[4];
  const sampleAssetCompleted = assetIds[8];

  const empSample = employeeIds[0];

  console.log("\n==================== DEMO CHEAT SHEET ====================");
  console.log("BASE_URL:", BASE_URL);

  console.log("\nUsers:");
  console.log("ADMIN:", adminId);
  console.log("RESOLVER1:", resolver1Id);
  console.log("RESOLVER2:", resolver2Id);
  console.log("EMPLOYEE sample:", empSample);

  console.log("\nSample IDs:");
  console.log("Ticket pending:", sampleTicketPending);
  console.log("Ticket accepted:", sampleTicketAccepted);
  console.log("Ticket completed:", sampleTicketCompleted);

  console.log("Asset pending:", sampleAssetPending);
  console.log("Asset accepted:", sampleAssetAccepted);
  console.log("Asset completed:", sampleAssetCompleted);

  console.log("\nQuick URLs:");
  console.log(`GET  ${BASE_URL}/tickets`);
  console.log(`GET  ${BASE_URL}/tickets/${sampleTicketPending}`);
  console.log(`GET  ${BASE_URL}/tickets/status/pending`);
  console.log(`GET  ${BASE_URL}/tickets/raised/${empSample}`);
  console.log(`GET  ${BASE_URL}/tickets/solved/${resolver1Id}`);

  console.log(`GET  ${BASE_URL}/assets`);
  console.log(`GET  ${BASE_URL}/assets/${sampleAssetPending}`);
  console.log(`GET  ${BASE_URL}/assets/status/pending`);
  console.log(`GET  ${BASE_URL}/assets/raised/${empSample}`);
  console.log(`GET  ${BASE_URL}/assets/solved/${resolver1Id}`);

  console.log(`GET  ${BASE_URL}/notifications/deadline/${adminId}`);
  console.log(`GET  ${BASE_URL}/notifications/ended/${adminId}`);
  console.log(`GET  ${BASE_URL}/notifications/deadline/${resolver1Id}`);
  console.log(`GET  ${BASE_URL}/notifications/ended/${resolver1Id}`);

  console.log(`GET  ${BASE_URL}/discussion/ticket/${sampleTicketPending}`);
  console.log(`POST ${BASE_URL}/discussion/ticket/${sampleTicketPending}/message`);

  console.log(`GET  ${BASE_URL}/discussion/asset/${sampleAssetPending}`);
  console.log(`POST ${BASE_URL}/discussion/asset/${sampleAssetPending}/message`);
  console.log("==========================================================\n");

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seeder Error:", err);
  process.exit(1);
});