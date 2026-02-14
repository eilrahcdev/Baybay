import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Always load server/.env no matter where you run the server from
dotenv.config({ path: path.resolve(__dirname, "../.env") })