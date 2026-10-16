import mongoose from "mongoose";
import { Request, Response } from "express";
import Event from "../models/event.model.ts";
import Registration from "../models/registration.model.ts";

/** Enough to catch a typo; deliberately not a full RFC 5322 parser. */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * POST /api/events/:id/register
 *
 * Public on purpose: the api-contract describes event registration as something
 * a visitor does without signing in, so there is no protectRoute here. The
 * admin-only event routes keep their guards.
 *
 * Body:    { visitorName, email, numGuests }
 * Returns: { success, registrationId, reference, spotRemaining }
 *
 * `reference` is a short, quotable form of the id ("A1B2C3") for confirmation
 * screens and front-desk conversations; the full id stays in registrationId.
 */
export const registerForEvent = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const { visitorName, email, numGuests } = req.body ?? {};

		if (!mongoose.isValidObjectId(id)) {
			return res
				.status(400)
				.json({ success: false, message: "That is not a valid event id" });
		}

		const guests = Number(numGuests);

		if (typeof visitorName !== "string" || visitorName.trim().length === 0) {
			return res
				.status(400)
				.json({ success: false, message: "Please enter your name" });
		}

		if (typeof email !== "string" || !EMAIL_PATTERN.test(email.trim())) {
			return res
				.status(400)
				.json({ success: false, message: "Please enter a valid email" });
		}

		if (!Number.isInteger(guests) || guests < 1) {
			return res
				.status(400)
				.json({ success: false, message: "At least 1 guest is required" });
		}

		// Reserve the places with a conditional update, so the capacity check and
		// the decrement happen in a single MongoDB operation. Two people
		// registering at the same moment can therefore not both take the last
		// place, which a read-then-write would allow.
		const event = await Event.findOneAndUpdate(
			{ _id: id, spotRemaining: { $gte: guests } },
			{ $inc: { spotRemaining: -guests } },
			{ new: true }
		);

		if (!event) {
			// Either the event does not exist, or it does not have that many
			// places left. Say which, with the real number.
			const existing = await Event.findById(id).lean();

			if (!existing) {
				return res
					.status(404)
					.json({ success: false, message: "Event not found" });
			}

			return res.status(409).json({
				success: false,
				message:
					existing.spotRemaining > 0
						? `Only ${existing.spotRemaining} place${
								existing.spotRemaining === 1 ? "" : "s"
							} left for this event`
						: "This event is fully booked",
			});
		}

		let registration;
		try {
			registration = await Registration.create({
				event: event._id,
				visitorName: visitorName.trim(),
				email: email.trim().toLowerCase(),
				numGuests: guests,
			});
		} catch (error) {
			// Give the places back rather than losing them to a failed write.
			await Event.updateOne(
				{ _id: event._id },
				{ $inc: { spotRemaining: guests } }
			);
			throw error;
		}

		res.status(201).json({
			success: true,
			registrationId: registration._id,
			reference: registration._id.toString().slice(-6).toUpperCase(),
			spotRemaining: event.spotRemaining,
		});
	} catch (error) {
		if (error instanceof Error) {
			console.log("Error in registerForEvent controller", error.message);
			res
				.status(500)
				.json({ success: false, message: "Server error", error: error.message });
		}
	}
};

/**
 * GET /api/events/:id/registrations
 *
 * The guest list for one event. Admin-only (guarded at the route): it returns
 * visitors' names and email addresses, so it must not be public.
 */
export const getEventRegistrations = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;

		if (!mongoose.isValidObjectId(id)) {
			return res
				.status(400)
				.json({ success: false, message: "That is not a valid event id" });
		}

		const registrations = await Registration.find({ event: id })
			.sort({ createdAt: 1 })
			.lean();

		const placesTaken = registrations.reduce(
			(total, registration) => total + registration.numGuests,
			0
		);

		res.json({
			success: true,
			count: registrations.length,
			placesTaken,
			registrations,
		});
	} catch (error) {
		if (error instanceof Error) {
			console.log("Error in getEventRegistrations controller", error.message);
			res
				.status(500)
				.json({ success: false, message: "Server error", error: error.message });
		}
	}
};
