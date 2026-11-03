import dotenv from "dotenv";
import { fileURLToPath } from "url";

// Load configuration before route modules initialize their clients.
// Existing process variables and a standard .env take precedence.
dotenv.config({ path: fileURLToPath(new URL("../.env", import.meta.url)), quiet: true });
dotenv.config({ path: fileURLToPath(new URL("../MuseumWebsite.env", import.meta.url)), quiet: true });
