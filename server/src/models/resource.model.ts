import mongoose, { Schema, Document } from "mongoose";

export type WorkKind = "ticket" | "asset";
export type EventType = "CREATED" | "ACCEPTED" | "COMPLETED";
export type ActorRole = "raised_by" | "accepted_by" | "completed_by";

// -------------------- Ticket --------------------
export interface ITicket extends Document {
  request_type: string;
}
const ticketSchema = new Schema<ITicket>(
  {
    request_type: { type: String, required: true, trim: true },
  },
  { versionKey: false }
);
export const Ticket = mongoose.model<ITicket>("Ticket", ticketSchema);

// -------------------- Asset --------------------
export interface IAsset extends Document {
  request_type: string;
}
const assetSchema = new Schema<IAsset>(
  {
    request_type: { type: String, required: true, trim: true },
  },
  { versionKey: false }
);
export const Asset = mongoose.model<IAsset>("Asset", assetSchema);

// -------------------- WorkEvent (deadline = dueAt) --------------------
export interface IWorkEvent extends Document {
  kind: WorkKind;
  refId: mongoose.Types.ObjectId;
  eventType: EventType;
  occurredAt: Date;
  dueAt?: Date | null; // ✅ estimated deadline for that stage
}
const workEventSchema = new Schema<IWorkEvent>(
  {
    kind: { type: String, enum: ["ticket", "asset"], required: true },
    refId: { type: Schema.Types.ObjectId, required: true },

    eventType: { type: String, enum: ["CREATED", "ACCEPTED", "COMPLETED"], required: true },

    occurredAt: { type: Date, default: Date.now, required: true },
    dueAt: { type: Date, default: null },
  },
  { versionKey: false }
);

// one event per stage
workEventSchema.index({ kind: 1, refId: 1, eventType: 1 }, { unique: true });
// fast deadline queries
workEventSchema.index({ eventType: 1, dueAt: 1 });

export const WorkEvent = mongoose.model<IWorkEvent>("WorkEvent", workEventSchema);

// -------------------- WorkEventActor --------------------
export interface IWorkEventActor extends Document {
  eventId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  role: ActorRole;
}
const workEventActorSchema = new Schema<IWorkEventActor>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: "WorkEvent", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, enum: ["raised_by", "accepted_by", "completed_by"], required: true },
  },
  { versionKey: false }
);

workEventActorSchema.index({ eventId: 1, role: 1 }, { unique: true });
workEventActorSchema.index({ userId: 1 });

export const WorkEventActor = mongoose.model<IWorkEventActor>("WorkEventActor", workEventActorSchema);

// ===================== Discussion / Comments =====================
export interface IDiscussionMessage {
  userId: mongoose.Types.ObjectId;
  message: string;
  createdAt: Date;
}

export interface IDiscussion extends Document {
  kind: WorkKind;
  refId: mongoose.Types.ObjectId;
  messages: IDiscussionMessage[];
}

const discussionSchema = new Schema<IDiscussion>(
  {
    kind: { type: String, enum: ["ticket", "asset"], required: true },
    refId: { type: Schema.Types.ObjectId, required: true },
    messages: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        message: { type: String, required: true, trim: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { versionKey: false }
);

discussionSchema.index({ kind: 1, refId: 1 }, { unique: true });

export const Discussion = mongoose.model<IDiscussion>("Discussion", discussionSchema);

// ===================== SLA Breach Collections =====================
// Accept breach
export interface ISlaAcceptBreach extends Document {
  kind: WorkKind;
  refId: mongoose.Types.ObjectId;
  dueAt: Date;
  breachedAt: Date;
}

const slaAcceptBreachSchema = new Schema<ISlaAcceptBreach>(
  {
    kind: { type: String, enum: ["ticket", "asset"], required: true },
    refId: { type: Schema.Types.ObjectId, required: true },
    dueAt: { type: Date, required: true },
    breachedAt: { type: Date, default: Date.now, required: true },
  },
  { versionKey: false }
);

slaAcceptBreachSchema.index({ kind: 1, refId: 1 }, { unique: true });

export const SlaAcceptBreach = mongoose.model<ISlaAcceptBreach>(
  "SlaAcceptBreach",
  slaAcceptBreachSchema
);

// Complete breach
export interface ISlaCompleteBreach extends Document {
  kind: WorkKind;
  refId: mongoose.Types.ObjectId;
  dueAt: Date;
  breachedAt: Date;
}

const slaCompleteBreachSchema = new Schema<ISlaCompleteBreach>(
  {
    kind: { type: String, enum: ["ticket", "asset"], required: true },
    refId: { type: Schema.Types.ObjectId, required: true },
    dueAt: { type: Date, required: true },
    breachedAt: { type: Date, default: Date.now, required: true },
  },
  { versionKey: false }
);

slaCompleteBreachSchema.index({ kind: 1, refId: 1 }, { unique: true });

export const SlaCompleteBreach = mongoose.model<ISlaCompleteBreach>(
  "SlaCompleteBreach",
  slaCompleteBreachSchema
);