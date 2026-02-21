import "dotenv/config";
import app from "./app";
import { connectDB } from "./config/db";

async function bootstrap() {
  await connectDB();

  const port = Number(process.env.PORT ?? 5000);
  app.listen(port, () => console.log(`✅ Server running on port ${port}`));
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});