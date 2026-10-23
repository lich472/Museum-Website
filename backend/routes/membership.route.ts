import express from "express";
import { protectRoute } from "../middleware/auth.middleware.ts";
import { getMyMembership, purchaseMembership, cancelMyMembership } from "../controllers/membership.controller.ts";

const router = express.Router();
router.get("/me", protectRoute, getMyMembership);
router.post("/", protectRoute, purchaseMembership);
router.post("/me/cancel", protectRoute, cancelMyMembership);
export default router;