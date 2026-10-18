import { Request, Response } from "express";
import crypto from "crypto";
import Booking from "../models/booking.model.ts";
import { sendBookingEmail } from "../utils/email.ts";
const COOLDOWN_MS = 60_000;
const lastSent = new Map<string, number>();


const PRICES_CENTS = { adult: 2000, child: 1000, concession: 1500, infant: 0 } as const;
const KEYS = Object.keys(PRICES_CENTS) as (keyof typeof PRICES_CENTS)[];

const todayInAdelaide = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Australia/Adelaide" }).format(new Date()); // YYYY-MM-DD

function validate(body: any): string | null {
  const { requestId, date, quantities, details } = body ?? {};
  if (typeof requestId !== "string" || !requestId) return "Missing request id";
  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return "Invalid visit date";
  if (date < todayInAdelaide()) return "Visit date is in the past";

  if (!quantities) return "Missing tickets";
  let total = 0;
  for (const k of KEYS) {
    const n = quantities[k] ?? 0;
    if (!Number.isInteger(n) || n < 0 || n > 20) return `Invalid ${k} quantity`;
    total += n;
  }
  if (total === 0) return "Choose at least one ticket";

  if (!details?.firstName?.trim() || !details?.lastName?.trim()) return "Name is required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.email ?? "")) return "Invalid email";
  if (!details.phone?.trim()) return "Phone is required";
  if (details.acceptedTerms !== true) return "Terms must be accepted";
  if (details.australianResident && !/^\d{4}$/.test(details.postcode ?? ""))
    return "Invalid postcode";
  return null;
}

export const createBooking = async (req: Request, res: Response) => {
  try {
    const problem = validate(req.body);
    if (problem) return res.status(400).json({ message: problem });

    const { requestId, date, quantities, details } = req.body;

    const existing = await Booking.findOne({ requestId });
    if (existing) return res.status(200).json(existing);

    const cleanQuantities = Object.fromEntries(KEYS.map((k) => [k, quantities[k] ?? 0]));
    const totalCents = KEYS.reduce((sum, k) => sum + PRICES_CENTS[k] * cleanQuantities[k], 0);

    const booking = await Booking.create({
      requestId,
      reference: "SA-" + crypto.randomBytes(4).toString("hex").toUpperCase(),
      date,
      quantities: cleanQuantities,
      totalCents, // always computed here, never trusted from the browser
      details: {
        firstName: details.firstName,
        lastName: details.lastName,
        email: details.email,
        dialCode: details.dialCode,
        phone: details.phone,
        australianResident: details.australianResident,
        postcode: details.australianResident ? details.postcode : "",
        marketingConsent: !!details.marketingConsent,
        acceptedTerms: true,
      },
    });
    sendBookingEmail(booking).catch((err) => console.error("Booking email failed:", err));
    res.status(201).json(booking);
  } catch (error: any) {
    if (error.name === "ValidationError") return res.status(400).json({ message: error.message });
    console.error("createBooking error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
export const getBookingByReference = async (req: Request, res: Response) => {
  try {
    const reference = req.params.reference?.toString().toUpperCase();
    if (!reference) {
      return res.status(400).json({ message: "Invalid reference parameter" });
    }

    const booking = await Booking.findOne({ reference: reference.toUpperCase() });
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    
    res.status(200).json(booking);
  } catch (error) {
    console.error("getBookingByReference error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const resendBookingEmail = async (req: Request, res: Response) => {
  try {
    const { reference } = req.params;

    if (typeof reference !== "string") {
      return res.status(400).json({ message: "Invalid reference parameter" });
    }

    const nextAllowedAt = lastSent.get(reference) ?? 0;
    if (Date.now() < nextAllowedAt) {
      return res.status(429).json({ message: "Please wait before requesting another email." });
    }

    const booking = await Booking.findOne({ reference });
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    await sendBookingEmail(booking);
    const allowedAt = Date.now() + COOLDOWN_MS;
    lastSent.set(reference, allowedAt);

    res.status(200).json({ email: booking.details?.email, nextAllowedAt: allowedAt });  } catch (error) {
    console.error("resendBookingEmail error:", error);
    res.status(500).json({ message: "Could not send email" });
  }
};