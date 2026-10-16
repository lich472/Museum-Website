import express from "express";
import { getAllEvent, createEvent, deleteEvent, getEventById, updateEvent } from "../controllers/event.controller.ts";
import { adminRoute, protectRoute } from "../middleware/auth.middleware.ts";

const router = express.Router();

router.get("/", getAllEvent);
router.post("/", protectRoute, adminRoute, createEvent);
router.get("/:id", getEventById);
router.delete("/:id", protectRoute, adminRoute, deleteEvent);
router.put("/:id", protectRoute, adminRoute, updateEvent);

export default router;
