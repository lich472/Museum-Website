import "dotenv/config";
import dotenv from "dotenv";
// Always load environment variables immediately at the top
dotenv.config(); 
// Fall back to the repository-root .env so a single file can serve both the
// server and `npm run seed` (the seed script reads it from there). dotenv never
// overwrites a variable that is already set, so backend/.env still wins when it
// exists. Needed because `npm run dev` runs with backend/ as the working
// directory, and a bare dotenv.config() would only look inside backend/.
dotenv.config({ path: path.resolve(process.cwd(), "..", ".env") });

import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import cors from "cors";  
import { fileURLToPath } from "url";

import authRoutes from "./routes/auth.route.ts";
import eventRoutes from "./routes/event.route.ts";
import exhibitionRoutes from "./routes/exhibition.route.ts";
import collectionRoutes from "./routes/collection.route.ts";
// Carried over from the Jason_P5 branch.
import recommendationRoutes from "./routes/recommendation.route.ts";
// Museum-wide visitor information (api-contract.md §3), owned by P4.
import visitorInfoRoutes from "./routes/visitorInfo.route.ts";
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

// With `credentials: true` the browser only accepts a response whose
// Access-Control-Allow-Origin matches the page's origin exactly, so the single
// hardcoded origin below made every signed-in request fail from any other dev
// port or deployed host. CORS_ORIGINS is a comma-separated list; when it is not
// set we keep the one local dev origin as the default.
const allowedOrigins = (process.env.CORS_ORIGINS ?? "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

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
// Tag-based "you might also like", from the Jason_P5 branch.
app.use("/api/recommendations", recommendationRoutes);
// Museum-wide visitor information (api-contract.md §3).
app.use("/api/visitor-info", visitorInfoRoutes);
// Ticket booking against the database, from main.
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
