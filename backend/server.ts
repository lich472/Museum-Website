import dotenv from "dotenv"
import express from "express"
import cookieParser from "cookie-parser";
import path from "path";

import authRoutes from "./routes/auth.route.ts";
import eventRoutes from "./routes/event.route.ts";
import exhibitionRoutes from "./routes/exhibition.route.ts";
import { connectDB } from "./lib/db.ts";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

const __dirname = path.resolve();

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

// TODO: Add more routes here such as exhibitions, event, membership, etc.
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/exhibitions", exhibitionRoutes);



app.listen(PORT, () => {
  console.log("Server is running on http://localhost:" + PORT);
  connectDB();
});