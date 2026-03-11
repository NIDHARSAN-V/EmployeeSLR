import "dotenv/config"; 
import "dotenv/config"; 
import { connectDB } from "./config/db";
import app from "./app"; 

async function bootstrap() {
  await connectDB();

  const port = Number(process.env.PORT ?? 3000);
  app.listen(port, () => console.log(`Server running on ${port}`));

}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
//server