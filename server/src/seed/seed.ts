// src/seed/seed.demo.routes.ts
// ✅ Complete Seeder that:
// 1) Clears ALL collections every run
// 2) Creates Users via /auth routes
// 3) Creates Tickets + Assets (pending/accepted/completed)
// 4) Adds discussion messages
// 5) Tunes dueAt to guarantee BOTH:
//    - /notifications/deadline/:userId shows items (NEAR window)
//    - /notifications/ended/:userId shows items (OVERDUE) + inserts SLA breach
// 6) Prints demo outputs + ready URLs

import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { User } from "../models/user.model";

// IMPORTANT: adjust path if your file name differs
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

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

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
  const res = await fetch(`${BASE_URL}/`, { method: "GET" }).catch(() => null);
  if (!res) throw new Error(`❌ Cannot reach server at ${BASE_URL}. Start backend first.`);
  console.log(`✅ Server reachable at ${BASE_URL} (status: ${res.status})`);
}

// -----------------------------
// Clear DB (every run)
// -----------------------------
async function clearDatabase() {
  console.log("🧹 Clearing existing data...");

  await Promise.all([
    User.deleteMany({}),
    Ticket.deleteMany({}),
    Asset.deleteMany({}),
    WorkEvent.deleteMany({}),
    WorkEventActor.deleteMany({}),
    Discussion.deleteMany({}),
    SlaAcceptBreach.deleteMany({}),
    SlaCompleteBreach.deleteMany({}),
  ]);

  console.log("✅ All collections cleared");
}

// -----------------------------
// Register + Login via routes
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
  // Create Tickets + Assets
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

  // Create:
  // Tickets: 18 -> 6 pending, 6 accepted-only, 6 completed
  // Assets : 12 -> 4 pending, 4 accepted-only, 4 completed

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

    if (i >= 6) {
      const resolver = i % 2 === 0 ? resolver1Id : resolver2Id;
      await http(`/tickets/${ticketId}/accept`, "POST", { accepted_by: resolver });
    }

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

    if (i >= 4) {
      const resolver = i % 2 === 0 ? resolver1Id : resolver2Id;
      await http(`/assets/${assetId}/accept`, "POST", { accepted_by: resolver });
    }

    if (i >= 8) {
      const resolver = i % 2 === 0 ? resolver1Id : resolver2Id;
      await http(`/assets/${assetId}/complete`, "POST", { completed_by: resolver });
    }
  }

  console.log("✅ Assets created:", assetIds.length);

  // -----------------------------
  // Add Discussion Messages
  // -----------------------------
  console.log("Adding discussion messages...");

  // tickets: 2 messages each (employee + resolver)
  for (let i = 0; i < 6; i++) {
    const tId = ticketIds[i];
    const empId = employeeIds[i % employeeIds.length];

    await http(`/discussion/ticket/${tId}/message`, "POST", {
      userId: empId,
      message: `Employee: I need help on ticket ${tId} (msg ${i + 1})`,
    });

    await http(`/discussion/ticket/${tId}/message`, "POST", {
      userId: resolver1Id,
      message: `Resolver: Acknowledged ticket ${tId}, will check (msg ${i + 1})`,
    });
  }

  // assets: 1 message each
  for (let i = 0; i < 4; i++) {
    const aId = assetIds[i];
    const empId = employeeIds[(i + 1) % employeeIds.length];

    await http(`/discussion/asset/${aId}/message`, "POST", {
      userId: empId,
      message: `Employee: Please process asset request ${aId} (msg ${i + 1})`,
    });
  }

  console.log("✅ Discussion messages added");

  // -----------------------------
  // Tune dueAt to GUARANTEE deadline + ended notifications
  // -----------------------------
  console.log("Tuning due times for notification demo...");

  const now = new Date();

  // Make demo stable:
  // - "Near" items => dueAt within next 40 seconds (will show in /deadline)
  // - "Overdue" items => dueAt 30 seconds ago (will show in /ended)
  const NEAR_IN_MS = 40 * 1000;
  const OVERDUE_MS = 30 * 1000;

  // TICKETS pending (0..5): CREATED dueAt
  // first 3 overdue, next 3 near
  for (let i = 0; i < 6; i++) {
    const refId = new mongoose.Types.ObjectId(ticketIds[i]);
    await WorkEvent.updateOne(
      { kind: "ticket", refId, eventType: "CREATED" },
      {
        $set: {
          occurredAt: new Date(now.getTime() - minMs(10)),
          dueAt: i < 3
            ? new Date(now.getTime() - OVERDUE_MS)
            : new Date(now.getTime() + NEAR_IN_MS),
        },
      }
    );
  }

  // TICKETS accepted-only (6..11): ACCEPTED dueAt
  // first 3 overdue, next 3 near
  for (let i = 6; i < 12; i++) {
    const refId = new mongoose.Types.ObjectId(ticketIds[i]);
    await WorkEvent.updateOne(
      { kind: "ticket", refId, eventType: "ACCEPTED" },
      {
        $set: {
          occurredAt: new Date(now.getTime() - minMs(8)),
          dueAt: i < 9
            ? new Date(now.getTime() - OVERDUE_MS)
            : new Date(now.getTime() + NEAR_IN_MS),
        },
      }
    );
  }

  // ASSETS pending (0..3): CREATED dueAt
  // first 2 overdue, next 2 near
  for (let i = 0; i < 4; i++) {
    const refId = new mongoose.Types.ObjectId(assetIds[i]);
    await WorkEvent.updateOne(
      { kind: "asset", refId, eventType: "CREATED" },
      {
        $set: {
          occurredAt: new Date(now.getTime() - minMs(12)),
          dueAt: i < 2
            ? new Date(now.getTime() - OVERDUE_MS)
            : new Date(now.getTime() + NEAR_IN_MS),
        },
      }
    );
  }

  // ASSETS accepted-only (4..7): ACCEPTED dueAt
  // first 2 overdue, next 2 near
  for (let i = 4; i < 8; i++) {
    const refId = new mongoose.Types.ObjectId(assetIds[i]);
    await WorkEvent.updateOne(
      { kind: "asset", refId, eventType: "ACCEPTED" },
      {
        $set: {
          occurredAt: new Date(now.getTime() - minMs(7)),
          dueAt: i < 6
            ? new Date(now.getTime() - OVERDUE_MS)
            : new Date(now.getTime() + NEAR_IN_MS),
        },
      }
    );
  }

  console.log("✅ Due times tuned");

  // Optional small delay so "minutesLeft" looks good in demo
  await sleep(1500);

  // -----------------------------
  // DEMO: Print deadline notifications
  // -----------------------------
  console.log("\n📌 Fetching NEAR DEADLINE notifications...");

  const adminDeadline = await http<any>(`/notifications/deadline/${adminId}`, "GET");
  console.log("\n--- ADMIN NEAR DEADLINE ---");
  console.log(JSON.stringify(adminDeadline, null, 2));

  const resolver1Deadline = await http<any>(`/notifications/deadline/${resolver1Id}`, "GET");
  console.log("\n--- RESOLVER1 NEAR DEADLINE ---");
  console.log(JSON.stringify(resolver1Deadline, null, 2));

  // -----------------------------
  // DEMO: Print overdue notifications (and insert SLA breach)
  // -----------------------------
  console.log("\n📌 Fetching OVERDUE notifications (and writing SLA breaches)...");

  const adminEnded = await http<any>(`/notifications/ended/${adminId}`, "GET");
  console.log("\n--- ADMIN OVERDUE ---");
  console.log(JSON.stringify(adminEnded, null, 2));

  const resolver1Ended = await http<any>(`/notifications/ended/${resolver1Id}`, "GET");
  console.log("\n--- RESOLVER1 OVERDUE ---");
  console.log(JSON.stringify(resolver1Ended, null, 2));

  console.log("\n✅ Notification demo complete.\n");

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