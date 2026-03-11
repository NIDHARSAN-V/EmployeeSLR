"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config"); // loads .env before reading process.env [web:23]
require("dotenv/config"); // ensure env loaded
const db_1 = require("./config/db");
const app_1 = __importDefault(require("./app")); // import configured express instance
async function bootstrap() {
    await (0, db_1.connectDB)();
    const port = Number(process.env.PORT ?? 3000);
    app_1.default.listen(port, () => console.log(`Server running on ${port}`));
}
bootstrap().catch((err) => {
    console.error(err);
    process.exit(1);
});
//server
