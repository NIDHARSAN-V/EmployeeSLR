import mongoose, { Schema, Document } from "mongoose";

export interface ITicket extends Document {
  request_type: string;
}

export interface IAsset extends Document {
  request_type: string;
}


export type WorkKind = "ticket" | "asset";
export type EventType = "CREATED" | "ACCEPTED" | "COMPLETED";
export type ActorRole = "raised_by" | "accepted_by" | "completed_by";
export interface IWorkEvent extends Document {
  kind: WorkKind;
  refId: mongoose.Types.ObjectId;
  eventType: EventType;
  occurredAt: Date;
  dueAt?: Date | null;
}

export interface IWorkEventActor extends Document {
  eventId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  role: ActorRole;
}

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


export interface ISlaAcceptBreach extends Document {
  kind: WorkKind;
  refId: mongoose.Types.ObjectId;
  dueAt: Date;
  breachedAt: Date;
}

export interface ISlaCompleteBreach extends Document {
  kind: WorkKind;
  refId: mongoose.Types.ObjectId;
  dueAt: Date;
  breachedAt: Date;
}