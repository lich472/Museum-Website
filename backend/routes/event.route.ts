import express from "express";
import { getAllEvent, createEvent, deleteEvent, getEventById } from "../controllers/event.controller.ts";
import { adminRoute, protectRoute } from "../middleware/auth.middleware.ts";

const router = express.Router();

router.post("/createEvent", createEvent);
router.get("/getAllEvent", protectRoute, getAllEvent);
router.get("/:id", protectRoute, getEventById);
router.delete("/:id", protectRoute, adminRoute, deleteEvent);

export default router;
