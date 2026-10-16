import express from "express";
import { getVisitorInfo, updateVisitorInfo } from "../controllers/visitorInfo.controller.ts";
import { adminRoute, protectRoute } from "../middleware/auth.middleware.ts";

const router = express.Router();

// Public: the accessibility and facilities pages read this while signed out.
router.get("/", getVisitorInfo);
// Staff only: this is the museum-wide content P4 edits in the admin dashboard.
router.put("/", protectRoute, adminRoute, updateVisitorInfo);

export default router;
