import mongoose from "mongoose";
 

export async function connectDB(){
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("MONGODB_URI is missing");
 
  await mongoose.connect(uri); // Mongoose supports connect(uri, options) [web:1]
 
  console.log("MongoDB connected");
}