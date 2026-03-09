
 // loads .env before reading process.env [web:23]
import "dotenv/config"; // ensure env loaded
import { connectDB } from "./config/db";
import app from "./app"; // import configured express instance




async function bootstrap() {
  await connectDB();

  const port = Number(process.env.PORT ?? 5000);
  app.listen(port, () => console.log(`✅ Server running on port ${port}`));

}




bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
