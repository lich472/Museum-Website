import express from "express";
import { createBooking, getBookingByReference,resendBookingEmail } from "../controllers/booking.controller.ts";

const router = express.Router();
router.post("/", createBooking);
router.get("/:reference", getBookingByReference);
router.post("/:reference/resend", resendBookingEmail);
export default router;