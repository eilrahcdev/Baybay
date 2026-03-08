import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Always load server/.env, even if you run from another folder.
dotenv.config({ path: path.resolve(__dirname, "../.env") })
