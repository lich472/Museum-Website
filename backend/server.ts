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

import authRoutes from "./routes/auth.route.ts";
import eventRoutes from "./routes/event.route.ts";
import exhibitionRoutes from "./routes/exhibition.route.ts";
import collectionRoutes from "./routes/collection.route.ts";
// Carried over from the Jason_P5 branch.
import recommendationRoutes from "./routes/recommendation.route.ts";
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
app.use("/api/collections", collectionRoutes);
// Tag-based "you might also like", from the Jason_P5 branch.
app.use("/api/recommendations", recommendationRoutes);



// Connect to MongoDB BEFORE accepting traffic. In the original order the server
// began answering requests while the Atlas handshake was still in flight, so a
// request that arrived in that window had no database connection: Mongoose
// buffered the query and it eventually failed, surfacing as a 500. A login
// attempt during startup used to hit exactly that. connectDB already exits the
// process when the connection fails, so a broken database now stops the server
// instead of leaving it up and serving errors.
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log("Server is running on http://localhost:" + PORT);
  });
});
