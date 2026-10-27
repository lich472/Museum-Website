import "dotenv/config";
import dotenv from "dotenv";
// Always load environment variables immediately at the top
dotenv.config(); 

import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import cors from "cors";  
import { fileURLToPath } from "url";

import authRoutes from "./routes/auth.route.ts";
import eventRoutes from "./routes/event.route.ts";
import exhibitionRoutes from "./routes/exhibition.route.ts";
import collectionRoutes from "./routes/collection.route.ts";
import { connectDB } from "./lib/db.ts";
import bookingRoutes from "./routes/booking.route.ts";
import membershipRoutes from "./routes/membership.route.ts";
import visitorInfoRoutes from './routes/visitorInfo.route.ts'
import recommendationRoutes from "./routes/recommendation.route.ts";

// Fix for __dirname in ES Modules/TypeScript environment
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001;

// 1. Place CORS right at the top so it intercepts every request
app.use(cors({
  origin: "https://museum-website-frontend.onrender.com", 
  credentials: true,               
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

// Serve static assets from your Vite production directory
app.use(express.static(path.join(__dirname, "frontend", "dist")));

// 2. Routes
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/exhibitions", exhibitionRoutes);
app.use("/api/collections", collectionRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/memberships", membershipRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use('/api/visitor-info', visitorInfoRoutes)

// Catch-all route for Express 5 targeting your Vite frontend build
app.get('/{*splat}', (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "dist", "index.html"));
});

app.listen(PORT, () => {
  console.log("Server is running on http://localhost:" + PORT);
  connectDB();
});
