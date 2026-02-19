import mongoose, { Document, Schema } from "mongoose";

export interface ITicket extends Document {
  type: "asset" | "ticket";
  request_type: string;

  raised_by: mongoose.Types.ObjectId;
  accepted_by?: mongoose.Types.ObjectId | null;
  completed_by?: mongoose.Types.ObjectId | null;

  status: "pending" | "accepted" | "completed";

  createdAt: Date;
  acceptedAt?: Date | null;
  completedAt?: Date | null;
}

const ticketSchema = new Schema<ITicket>({
  type: { type: String, enum: ["asset", "ticket"], required: true },
  request_type: { type: String, required: true },

  raised_by: { type: Schema.Types.ObjectId, ref: "User", required: true },
  accepted_by: { type: Schema.Types.ObjectId, ref: "User", default: null },
  completed_by: { type: Schema.Types.ObjectId, ref: "User", default: null },

  status: {
    type: String,
    enum: ["pending", "accepted", "completed"],
    default: "pending"
  },

  createdAt: { type: Date, default: Date.now },
  acceptedAt: { type: Date, default: null },
  completedAt: { type: Date, default: null }
});

export default mongoose.model<ITicket>("Ticket", ticketSchema);
