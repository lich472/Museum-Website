import express from "express";
import { createBooking, getBookingByReference,resendBookingEmail,getMyBookings } from "../controllers/booking.controller.ts";
import { protectRoute } from "../middleware/auth.middleware.ts";
import { optionalAuth } from "../middleware/auth.middleware.ts";

const router = express.Router();

router.post("/", optionalAuth, createBooking);
router.get("/mine", protectRoute, getMyBookings);
router.post("/:reference/resend", resendBookingEmail);
router.get("/:reference", getBookingByReference);
export default router;