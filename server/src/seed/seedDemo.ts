import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

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

const PASSWORD = "Pass@1234";
const MONGO_URL =
  process.env.MONGO_URL ||
  process.env.MONGO_URI ||
  "mongodb://127.0.0.1:27017/helpdesk_demo";

// -----------------------------
// Helpers
// -----------------------------
const minMs = (m: number) => m * 60 * 1000;

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// scoped http helper that uses a baseUrl (computed per-call)
async function http<T>(
  baseUrl: string,
  path: string,
  method: "GET" | "POST" = "GET",
  body?: any
): Promise<T> {
  const res = await fetch(`${baseUrl}${path}`, {
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

async function pingServer(baseUrl: string) {
  const res = await fetch(`${baseUrl}/`, { method: "GET" }).catch(() => null);
  if (!res) throw new Error(`❌ Cannot reach server at ${baseUrl}. Start backend first.`);
}

async function clearDatabase() {
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
}

type SeedResult = {
  ok: true;
  startedAt: string;
  finishedAt: string;
  summary: {
    usersCreated: number;
    ticketsCreated: number;
    assetsCreated: number;
  };
  cheatSheet: any;
  logs: string[];
} | {
  ok: false;
  error: string;
  logs: string[];
};

let isSeeding = false;

/**
 * Seeds demo data by calling your existing HTTP routes.
 * - Optionally pass baseUrl; else uses SEED_BASE_URL or http://localhost:3000
 * - Returns logs, summary, and a cheat sheet for quick testing.
 */
export async function seedDemo(baseUrl?: string): Promise<SeedResult> {

    console.log("Seeding.......")
  if (isSeeding) {
    return {
      ok: false,
      error: "Seeding already in progress.",
      logs: [],
    };
  }

  const BASE_URL = baseUrl || process.env.SEED_BASE_URL || "http://localhost:3000";
  const logs: string[] = [];
  const startedAt = new Date().toISOString();

  try {
    isSeeding = true;

    // Ensure DB connection
    if (mongoose.connection.readyState !== 1) {
      logs.push(`Connecting DB at ${MONGO_URL}...`);
      await mongoose.connect(MONGO_URL);
      logs.push("✅ DB connected");
    } else {
      logs.push("ℹ️ DB already connected");
    }

    // Sanity check: server reachable (your other routes must be mounted)
    await pingServer(BASE_URL);
    logs.push(`✅ Server reachable at ${BASE_URL}`);

    // Clear all collections each run
    logs.push("🧹 Clearing existing data...");
    await clearDatabase();
    logs.push("✅ All collections cleared");

    // -----------------------------
    // Register + Login via routes
    // -----------------------------
    async function registerAndLogin(userName: string, email: string, role: string) {
      await http<any>(BASE_URL, "/auth/register", "POST", {
        userName,
        email,
        password: PASSWORD,
        role,
      });

      const login = await http<any>(BASE_URL, "/auth/login", "POST", {
        email,
        password: PASSWORD,
      });
      return login.user.id as string;
    }

    // -----------------------------
    // Create Users
    // -----------------------------
    logs.push("👤 Creating Users...");
    const adminId = await registerAndLogin("Admin Demo", "admin@test.com", "ADMIN");
    const resolver1Id = await registerAndLogin("Resolver 1", "resolver1@test.com", "RESOLVER");
    const resolver2Id = await registerAndLogin("Resolver 2", "resolver2@test.com", "RESOLVER");

    const employeeIds: string[] = [];
    for (let i = 1; i <= 6; i++) {
      const id = await registerAndLogin(`Employee ${i}`, `employee${i}@test.com`, "EMPLOYEE");
      employeeIds.push(id);
    }
    logs.push("✅ Users created");

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

    // Tickets: 18 -> 6 pending, 6 accepted-only, 6 completed
    // Assets : 12 -> 4 pending, 4 accepted-only, 4 completed
    logs.push("🎫 Creating Tickets...");
    const ticketIds: string[] = [];

    for (let i = 0; i < 18; i++) {
      const raisedBy = employeeIds[i % employeeIds.length];
      const reqType = TICKET_TYPES[i % TICKET_TYPES.length];

      const created = await http<any>(BASE_URL, "/tickets", "POST", {
        request_type: reqType,
        raised_by: raisedBy,
      });

      const ticketId = String(created.refId);
      ticketIds.push(ticketId);

      if (i >= 6) {
        const resolver = i % 2 === 0 ? resolver1Id : resolver2Id;
        await http(BASE_URL, `/tickets/${ticketId}/accept`, "POST", { accepted_by: resolver });
      }

      if (i >= 12) {
        const resolver = i % 2 === 0 ? resolver1Id : resolver2Id;
        await http(BASE_URL, `/tickets/${ticketId}/complete`, "POST", { completed_by: resolver });
      }
    }
    logs.push(`✅ Tickets created: ${ticketIds.length}`);

    logs.push("🖥️ Creating Assets...");
    const assetIds: string[] = [];

    for (let i = 0; i < 12; i++) {
      const raisedBy = employeeIds[(i + 2) % employeeIds.length];
      const reqType = ASSET_TYPES[i % ASSET_TYPES.length];

      const created = await http<any>(BASE_URL, "/assets", "POST", {
        request_type: reqType,
        raised_by: raisedBy,
      });

      const assetId = String(created.refId);
      assetIds.push(assetId);

      if (i >= 4) {
        const resolver = i % 2 === 0 ? resolver1Id : resolver2Id;
        await http(BASE_URL, `/assets/${assetId}/accept`, "POST", { accepted_by: resolver });
      }

      if (i >= 8) {
        const resolver = i % 2 === 0 ? resolver1Id : resolver2Id;
        await http(BASE_URL, `/assets/${assetId}/complete`, "POST", { completed_by: resolver });
      }
    }
    logs.push(`✅ Assets created: ${assetIds.length}`);

    // -----------------------------
    // Add Discussion Messages
    // -----------------------------
    logs.push("💬 Adding discussion messages...");

    // tickets: 2 messages each (employee + resolver)
    for (let i = 0; i < 6; i++) {
      const tId = ticketIds[i];
      const empId = employeeIds[i % employeeIds.length];

      await http(BASE_URL, `/discussion/ticket/${tId}/message`, "POST", {
        userId: empId,
        message: `Employee: I need help on ticket ${tId} (msg ${i + 1})`,
      });

      await http(BASE_URL, `/discussion/ticket/${tId}/message`, "POST", {
        userId: (i % 2 === 0 ? resolver1Id : resolver2Id),
        message: `Resolver: Acknowledged ticket ${tId}, will check (msg ${i + 1})`,
      });
    }

    // assets: 1 message each
    for (let i = 0; i < 4; i++) {
      const aId = assetIds[i];
      const empId = employeeIds[(i + 1) % employeeIds.length];

      await http(BASE_URL, `/discussion/asset/${aId}/message`, "POST", {
        userId: empId,
        message: `Employee: Please process asset request ${aId} (msg ${i + 1})`,
      });
    }
    logs.push("✅ Discussion messages added");

    // -----------------------------
    // Tune dueAt for notifications demo
    // -----------------------------
    logs.push("⏱️ Tuning due times for notification demo...");

    const now = new Date();
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
            dueAt:
              i < 3
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
            dueAt:
              i < 9
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
            dueAt:
              i < 2
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
            dueAt:
              i < 6
                ? new Date(now.getTime() - OVERDUE_MS)
                : new Date(now.getTime() + NEAR_IN_MS),
          },
        }
      );
    }

    logs.push("✅ Due times tuned");

    // small delay so "minutesLeft" looks good in demo
    await sleep(1500);

    // -----------------------------
    // DEMO: Fetch notifications
    // -----------------------------
    logs.push("🔔 Fetching NEAR DEADLINE notifications...");
    const adminDeadline = await http<any>(BASE_URL, `/notifications/deadline/${adminId}`, "GET");

    logs.push("⛔ Fetching OVERDUE notifications (and writing SLA breaches)...");
    const adminEnded = await http<any>(BASE_URL, `/notifications/ended/${adminId}`, "GET");

    // -----------------------------
    // Prepare cheat sheet
    // -----------------------------
    const sampleTicketPending = ticketIds[0];
    const sampleTicketAccepted = ticketIds[6];
    const sampleTicketCompleted = ticketIds[12];

    const sampleAssetPending = assetIds[0];
    const sampleAssetAccepted = assetIds[4];
    const sampleAssetCompleted = assetIds[8];

    const empSample = employeeIds[0];

    const cheatSheet = {
      BASE_URL,
      users: {
        ADMIN: adminId,
        RESOLVER1: resolver1Id,
        RESOLVER2: resolver2Id,
        EMPLOYEE_sample: empSample,
      },
      sampleIds: {
        ticket_pending: sampleTicketPending,
        ticket_accepted: sampleTicketAccepted,
        ticket_completed: sampleTicketCompleted,
        asset_pending: sampleAssetPending,
        asset_accepted: sampleAssetAccepted,
        asset_completed: sampleAssetCompleted,
      },
      quickUrls: {
        tickets_all: `${BASE_URL}/tickets`,
        ticket_sample: `${BASE_URL}/tickets/${sampleTicketPending}`,
        tickets_pending: `${BASE_URL}/tickets/status/pending`,
        tickets_raised_by_emp: `${BASE_URL}/tickets/raised/${empSample}`,
        tickets_solved_by_resolver1: `${BASE_URL}/tickets/solved/${resolver1Id}`,

        assets_all: `${BASE_URL}/assets`,
        asset_sample: `${BASE_URL}/assets/${sampleAssetPending}`,
        assets_pending: `${BASE_URL}/assets/status/pending`,
        assets_raised_by_emp: `${BASE_URL}/assets/raised/${empSample}`,
        assets_solved_by_resolver1: `${BASE_URL}/assets/solved/${resolver1Id}`,

        notifications_admin_deadline: `${BASE_URL}/notifications/deadline/${adminId}`,
        notifications_admin_ended: `${BASE_URL}/notifications/ended/${adminId}`,
        notifications_resolver1_deadline: `${BASE_URL}/notifications/deadline/${resolver1Id}`,
        notifications_resolver1_ended: `${BASE_URL}/notifications/ended/${resolver1Id}`,

        discussion_ticket_get: `${BASE_URL}/discussion/ticket/${sampleTicketPending}`,
        discussion_ticket_post: `${BASE_URL}/discussion/ticket/${sampleTicketPending}/message`,

        discussion_asset_get: `${BASE_URL}/discussion/asset/${sampleAssetPending}`,
        discussion_asset_post: `${BASE_URL}/discussion/asset/${sampleAssetPending}/message`,
      },
      notificationsSamples: {
        nearDeadline_admin: adminDeadline,
        overdue_admin: adminEnded,
      },
    };

    return {
      ok: true,
      startedAt,
      finishedAt: new Date().toISOString(),
      summary: {
        usersCreated: 9,
        ticketsCreated: ticketIds.length,
        assetsCreated: assetIds.length,
      },
      cheatSheet,
      logs,
    };
  } catch (err: any) {
    console.error("Seeder Error:", err);
    return {
      ok: false,
      error: err?.message || "Unknown error",
      logs,
    };
  } finally {
    isSeeding = false;
    // Note: we intentionally do NOT disconnect mongoose here in a long-running server.
  }
}

export default seedDemo;