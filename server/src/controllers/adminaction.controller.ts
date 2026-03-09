import mongoose from "mongoose";
import { WorkEvent, WorkEventActor } from "../models/resource.model";
import { User } from "../models/user.model";
// import { minutesToMs } from "../service/resourceservice";
import {
  ACCEPT_SLA_MIN,
  COMPLETE_SLA_MIN,
  minutesToMs,
  isValidObjectId,
  isValidStatus,
  getRole,
  buildView,
  ensureDiscussion,
} from "../service/resourceservice";



const assignToResolver = async function(req:any , res : any) 
{
    console.log(req.body)
   //find the free resolver  or assign to a resolver with least load

   const {ticket}   = req.body;

   

    const resolver = await freeResolvers();

    if(!resolver) return res.status(404).json({message : "No resolver available"});

    const resolverId = resolver._id;
    console.log("Resolver " , resolver._id)

    
    await WorkEvent.deleteOne({kind : "ticket" , refId : ticket.refId , eventType : "CREATED"});

    
      const acceptedAt = new Date();
      const dueAt = new Date(acceptedAt.getTime() + minutesToMs(COMPLETE_SLA_MIN));
    
      const newAcceptEvent = await WorkEvent.create({
        kind: "ticket",
        refId: new mongoose.Types.ObjectId(ticket.refId),
        eventType: "ACCEPTED",
        occurredAt: acceptedAt,
        dueAt,
      });


   //make reolver to  accept 
    const acceptEventActor = new WorkEventActor({
        eventId: newAcceptEvent._id,
        userId: resolverId,
        role: "accepted_by"
    });

    await acceptEventActor.save();
   //delete the event from pending accept list


    

    return res.json({message : "Assigned to resolver successfully"}) 
}



const freeResolvers = async function()
{
     const all_resolvers = await User.find({role : "RESOLVER"}).lean();
     
     const free_resolver= []

        for(const r of all_resolvers)
        {
          //count on event actor 
          const count = await WorkEventActor.countDocuments({userId : r._id , role : "accepted_by"});
          if(count === 0)
          {
            free_resolver.push(r);
            break;
          }
        }

    if(free_resolver.length > 0) 
        return free_resolver[0];

    //if no free resolver find the one with least load
    let least_load = Number.MAX_VALUE;
    let selected_resolver = null;

    for(const r of all_resolvers)
    {
      const count = await WorkEventActor.countDocuments({userId : r._id , role : "accepted_by"});
      if(count < least_load)
      {
        least_load = count;
        selected_resolver = r;
      }
    }


    return selected_resolver;





}




export default assignToResolver;



