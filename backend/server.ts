import dotenv from "dotenv"
import express from "express"
import cookieParser from "cookie-parser";
import path from "path";
import cors from "cors";  

import authRoutes from "./routes/auth.route.ts";
import eventRoutes from "./routes/event.route.ts";
import exhibitionRoutes from "./routes/exhibition.route.ts";
import { connectDB } from "./lib/db.ts";

if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

const app = express();
const PORT = process.env.PORT || 5001;

const __dirname = path.resolve();

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

if (process.env.NODE_ENV !== "production") {
  app.use(
    cors({
      origin: "http://localhost:5173",  // frontend dev URL
      credentials: true                 // allow cookies
    })
  );
}

// TODO: Add more routes here such as exhibitions, event, membership, etc.
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/exhibitions", exhibitionRoutes);



app.listen(PORT, () => {
  console.log("Server is running on http://localhost:" + PORT);
  connectDB();
});