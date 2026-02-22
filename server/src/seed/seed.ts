import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { User } from "../models/user.model";
import { Ticket, Asset, WorkEvent, WorkEventActor } from "../models/resource.model";

const BASE_URL = process.env.SEED_BASE_URL || "http://127.0.0.1:8000";
const MONGO_URL =
  process.env.MONGO_URL ||
  process.env.MONGO_URI ||
  "mongodb://127.0.0.1:27017/helpdesk_demo";

const PASSWORD = "Pass@1234";

// ==============================
// 🔥 CLEAR DATABASE FUNCTION
// ==============================
async function clearDatabase() {
  console.log("🧹 Clearing existing data...");

  await Promise.all([
    User.deleteMany({}),
    Ticket.deleteMany({}),
    Asset.deleteMany({}),
    WorkEvent.deleteMany({}),
    WorkEventActor.deleteMany({}),
  ]);

  console.log("✅ All collections cleared");
}

// ==============================
// 🌐 HTTP HELPER
// ==============================
async function http<T>(path: string, method: "GET" | "POST" = "GET", body?: any): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${path} -> ${JSON.stringify(json)}`);
  }

  return json as T;
}

// ==============================
// 👤 USER REGISTER VIA ROUTE
// ==============================
async function register(userName: string, email: string, role: string) {
  await http("/auth/register", "POST", {
    userName,
    email,
    password: PASSWORD,
    role,
  });

  const login = await http<any>("/auth/login", "POST", {
    email,
    password: PASSWORD,
  });

  return login.user.id;
}

// ==============================
// 🚀 MAIN SEED
// ==============================
async function seed() {
  console.log("Connecting DB...");
  await mongoose.connect(MONGO_URL);

  // 🔥 ALWAYS CLEAR FIRST
  await clearDatabase();

  console.log("Creating Users...");

  const adminId = await register("Admin Demo", "admin@test.com", "ADMIN");
  const resolverId = await register("Resolver Demo", "resolver@test.com", "RESOLVER");

  const employeeIds: string[] = [];
  for (let i = 1; i <= 5; i++) {
    const id = await register(`Employee ${i}`, `employee${i}@test.com`, "EMPLOYEE");
    employeeIds.push(id);
  }

  console.log("Users Created");

  // ==============================
  // 🎫 CREATE SAMPLE TICKETS
  // ==============================
  const ticketTypes = [
    "Laptop Not Working",
    "Printer Offline",
    "Network Connectivity Issue",
    "VPN Not Connecting",
    "System Crash",
  ];

  for (let i = 0; i < 10; i++) {
    const ticket = await http<any>("/tickets", "POST", {
      request_type: ticketTypes[i % ticketTypes.length],
      raised_by: employeeIds[i % employeeIds.length],
    });

    const ticketId = ticket.refId;

    if (i >= 4) {
      await http(`/tickets/${ticketId}/accept`, "POST", {
        accepted_by: resolverId,
      });
    }

    if (i >= 7) {
      await http(`/tickets/${ticketId}/complete`, "POST", {
        completed_by: resolverId,
      });
    }
  }

  // ==============================
  // 📦 CREATE SAMPLE ASSETS
  // ==============================
  const assetTypes = [
    "New Laptop Request",
    "Monitor Request",
    "Keyboard Replacement",
    "RAM Upgrade",
  ];

  for (let i = 0; i < 6; i++) {
    const asset = await http<any>("/assets", "POST", {
      request_type: assetTypes[i % assetTypes.length],
      raised_by: employeeIds[i % employeeIds.length],
    });

    const assetId = asset.refId;

    if (i >= 3) {
      await http(`/assets/${assetId}/accept`, "POST", {
        accepted_by: resolverId,
      });
    }
  }

  console.log("Demo Data Created Successfully");

  console.log("\n==================== DEMO IDS ====================");
  console.log("ADMIN:", adminId);
  console.log("RESOLVER:", resolverId);
  console.log("EMPLOYEE:", employeeIds[0]);
  console.log("==================================================\n");

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seeder Error:", err);
  process.exit(1);
});