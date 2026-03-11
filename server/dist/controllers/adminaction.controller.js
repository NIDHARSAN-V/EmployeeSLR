"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const resource_model_1 = require("../models/resource.model");
const user_model_1 = require("../models/user.model");
// import { minutesToMs } from "../service/resourceservice";
const resourceservice_1 = require("../service/resourceservice");
const assignToResolver = async function (req, res) {
    console.log(req.body);
    //find the free resolver  or assign to a resolver with least load
    const { ticket } = req.body;
    const resolver = await freeResolvers();
    if (!resolver)
        return res.status(404).json({ message: "No resolver available" });
    const resolverId = resolver._id;
    console.log("Resolver ", resolver._id);
    await resource_model_1.WorkEvent.deleteOne({ kind: "ticket", refId: ticket.refId, eventType: "CREATED" });
    const acceptedAt = new Date();
    const dueAt = new Date(acceptedAt.getTime() + (0, resourceservice_1.minutesToMs)(resourceservice_1.COMPLETE_SLA_MIN));
    const newAcceptEvent = await resource_model_1.WorkEvent.create({
        kind: "ticket",
        refId: new mongoose_1.default.Types.ObjectId(ticket.refId),
        eventType: "ACCEPTED",
        occurredAt: acceptedAt,
        dueAt,
    });
    //make reolver to  accept 
    const acceptEventActor = new resource_model_1.WorkEventActor({
        eventId: newAcceptEvent._id,
        userId: resolverId,
        role: "accepted_by"
    });
    await acceptEventActor.save();
    //delete the event from pending accept list
    return res.json({ message: "Assigned to resolver successfully" });
};
const freeResolvers = async function () {
    const all_resolvers = await user_model_1.User.find({ role: "RESOLVER" }).lean();
    const free_resolver = [];
    for (const r of all_resolvers) {
        //count on event actor 
        const count = await resource_model_1.WorkEventActor.countDocuments({ userId: r._id, role: "accepted_by" });
        if (count === 0) {
            free_resolver.push(r);
            break;
        }
    }
    if (free_resolver.length > 0)
        return free_resolver[0];
    //if no free resolver find the one with least load
    let least_load = Number.MAX_VALUE;
    let selected_resolver = null;
    for (const r of all_resolvers) {
        const count = await resource_model_1.WorkEventActor.countDocuments({ userId: r._id, role: "accepted_by" });
        if (count < least_load) {
            least_load = count;
            selected_resolver = r;
        }
    }
    return selected_resolver;
};
exports.default = assignToResolver;
