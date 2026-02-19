import "dotenv/config"; // loads .env before reading process.env [web:23]
import express from "express";
import { connectDB } from "./config/db";
 
async function bootstrap() {
  await connectDB();
 
  const app = express();
  app.use(express.json());
 
  const port = Number(process.env.PORT ?? 3000);
  app.listen(port, () => console.log(`Server running on ${port}`));
}
 
bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});