import mongoose, { Document, Schema } from "mongoose";
import { Role } from "../types/user.types";

export interface IUser extends Document {
  userName: string;
  email: string;
  password: string;
  role: Role;
}

const userSchema = new Schema<IUser>(
  {
    userName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: Object.values(Role),
      default: Role.EMPLOYEE
    }
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>("User", userSchema);
