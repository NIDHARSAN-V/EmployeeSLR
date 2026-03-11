"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = connectDB;
const mongoose_1 = __importDefault(require("mongoose"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, "../../.env") }); // Load .env from project root
async function connectDB() {
    const uri = process.env.MONGO_URI;
    if (!uri)
        throw new Error("MONGODB_URI is missing");
    await mongoose_1.default.connect(uri); // Mongoose supports connect(uri, options) [web:1]
    console.log("MongoDB connected");
}
