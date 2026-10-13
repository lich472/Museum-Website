import dotenv from "dotenv";
// Always load environment variables immediately at the top
dotenv.config(); 

import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import cors from "cors";  

import authRoutes from "./routes/auth.route.ts";
import eventRoutes from "./routes/event.route.ts";
import exhibitionRoutes from "./routes/exhibition.route.ts";
import { connectDB } from "./lib/db.ts";

const app = express();
const PORT = process.env.PORT || 5001;

// 1. Place CORS right at the top so it intercepts every request
app.use(cors({
  origin: "http://localhost:5173", 
  credentials: true,               
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

// 2. Routes
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/exhibitions", exhibitionRoutes);



app.listen(PORT, () => {
  console.log("Server is running on http://localhost:" + PORT);
  connectDB();
});