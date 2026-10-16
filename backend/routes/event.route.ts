import express from "express";
import { getAllEvent, createEvent, deleteEvent, getEventById, updateEvent } from "../controllers/event.controller.ts";
import { getEventRegistrations, registerForEvent } from "../controllers/registration.controller.ts";
import { adminRoute, protectRoute } from "../middleware/auth.middleware.ts";

const router = express.Router();

router.get("/", getAllEvent);
router.post("/", protectRoute, adminRoute, createEvent);
router.get("/:id", getEventById);

// Public: a visitor registers for a free event without signing in.
router.post("/:id/register", registerForEvent);
// Not public: it returns visitors' names and email addresses.
router.get("/:id/registrations", protectRoute, adminRoute, getEventRegistrations);

router.delete("/:id", protectRoute, adminRoute, deleteEvent);
router.put("/:id", protectRoute, adminRoute, updateEvent);

export default router;
