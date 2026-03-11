"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlaCompleteBreach = exports.SlaAcceptBreach = exports.Discussion = exports.WorkEventActor = exports.WorkEvent = exports.Asset = exports.Ticket = void 0;
const mongoose_1 = __importStar(require("mongoose"));
//  Ticket 
const ticketSchema = new mongoose_1.Schema({
    request_type: { type: String, required: true, trim: true },
}, { versionKey: false });
exports.Ticket = mongoose_1.default.model("Ticket", ticketSchema);
// Asset 
const assetSchema = new mongoose_1.Schema({
    request_type: { type: String, required: true, trim: true },
}, { versionKey: false });
exports.Asset = mongoose_1.default.model("Asset", assetSchema);
// WorkEvent 
const workEventSchema = new mongoose_1.Schema({
    kind: { type: String, enum: ["ticket", "asset"], required: true },
    refId: { type: mongoose_1.Schema.Types.ObjectId, required: true },
    eventType: { type: String, enum: ["CREATED", "ACCEPTED", "COMPLETED"], required: true },
    occurredAt: { type: Date, default: Date.now, required: true },
    dueAt: { type: Date, default: null },
}, { versionKey: false });
// one event per stage
workEventSchema.index({ kind: 1, refId: 1, eventType: 1 }, { unique: true });
workEventSchema.index({ eventType: 1, dueAt: 1 });
exports.WorkEvent = mongoose_1.default.model("WorkEvent", workEventSchema);
// WorkEventActor 
const workEventActorSchema = new mongoose_1.Schema({
    eventId: { type: mongoose_1.Schema.Types.ObjectId, ref: "WorkEvent", required: true },
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, enum: ["raised_by", "accepted_by", "completed_by"], required: true },
}, { versionKey: false });
workEventActorSchema.index({ eventId: 1, role: 1 }, { unique: true });
workEventActorSchema.index({ userId: 1 });
exports.WorkEventActor = mongoose_1.default.model("WorkEventActor", workEventActorSchema);
//  Discussion / Comments 
const discussionSchema = new mongoose_1.Schema({
    kind: { type: String, enum: ["ticket", "asset"], required: true },
    refId: { type: mongoose_1.Schema.Types.ObjectId, required: true },
    messages: [
        {
            userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
            message: { type: String, required: true, trim: true },
            createdAt: { type: Date, default: Date.now },
        },
    ],
}, { versionKey: false });
discussionSchema.index({ kind: 1, refId: 1 }, { unique: true });
exports.Discussion = mongoose_1.default.model("Discussion", discussionSchema);
//Testing phase SLA Breach Collections 
// Accept breach
const slaAcceptBreachSchema = new mongoose_1.Schema({
    kind: { type: String, enum: ["ticket", "asset"], required: true },
    refId: { type: mongoose_1.Schema.Types.ObjectId, required: true },
    dueAt: { type: Date, required: true },
    breachedAt: { type: Date, default: Date.now, required: true },
}, { versionKey: false });
slaAcceptBreachSchema.index({ kind: 1, refId: 1 }, { unique: true });
exports.SlaAcceptBreach = mongoose_1.default.model("SlaAcceptBreach", slaAcceptBreachSchema);
const slaCompleteBreachSchema = new mongoose_1.Schema({
    kind: { type: String, enum: ["ticket", "asset"], required: true },
    refId: { type: mongoose_1.Schema.Types.ObjectId, required: true },
    dueAt: { type: Date, required: true },
    breachedAt: { type: Date, default: Date.now, required: true },
}, { versionKey: false });
slaCompleteBreachSchema.index({ kind: 1, refId: 1 }, { unique: true });
exports.SlaCompleteBreach = mongoose_1.default.model("SlaCompleteBreach", slaCompleteBreachSchema);
