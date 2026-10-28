import Event from "../models/event.model.ts";
import { Request, Response } from "express";
import mongoose from 'mongoose';
import Registration from '../models/registration.model';

/**
 * The same mapping `collection.controller.ts` uses: a ValidationError or a
 * CastError means the request was wrong, so it is answered with 400 and a
 * generic message. Everything else is a real server fault and is logged and
 * reported as 500 without leaking the Mongoose text to the caller.
 */
function handleError(res: Response, error: any, label: string) {
	if (error?.name === "ValidationError") {
		return res.status(400).json({ message: error.message });
	}
	if (error?.name === "CastError") {
		return res.status(400).json({ message: "Invalid event id" });
	}
	console.error(`${label} error:`, error);
	return res.status(500).json({ message: "Server error" });
}

export const getAllEvent = async (req: Request, res: Response) => {
	try {
		const events = await Event.find({}); // find all Event
		res.json({ events });
	} catch (error) {
		handleError(res, error, "getAllEvent");
	}
};

export const createEvent = async (req: Request, res: Response) => {
	try {
		const { title, description, imageUrl, startDate, endDate, spotRemaining, type, capacity, location } = req.body;

		const event = await Event.create({
			title,
			description,
			imageUrl,
			startDate,
			endDate,
			spotRemaining,
            type, 
            capacity,
			location
		});

		res.status(201).json(event);
	} catch (error) {
		handleError(res, error, "createEvent");
	}
};

export const deleteEvent = async (req: Request, res: Response) => {
	try {
		const event = await Event.findById(req.params.id);

		if (!event) {
			return res.status(404).json({ message: "Event not found" });
		}

		await Event.findByIdAndDelete(req.params.id);

		res.json({ message: "Event deleted successfully" });
	} catch (error) {
		handleError(res, error, "deleteEvent");
	}
};

export const getEventById = async (req: Request, res: Response) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json(event);
  } catch (error) {
	handleError(res, error, "getEventById");
  }
};

export const updateEvent = async (req: Request, res: Response) => {
	try {
		const { title,
			description,
			imageUrl,
			startDate,
			endDate,
			spotRemaining,
            type, 
            capacity,
			location } = req.body;

		// Find the item by ID and pass the updated body values
		const updatedEvent = await Event.findByIdAndUpdate(
			req.params.id,
			{ title,
			description,
			imageUrl,
			startDate,
			endDate,
			spotRemaining,
            type, 
            capacity,
			location },
			// runValidators: without it Mongoose skipped required/enum checking on
			// update, so a `type` outside the schema enum was stored as-is and only
			// surfaced later as a broken document.
			{ new: true, runValidators: true } 
		);

		if (!updatedEvent) {
			return res.status(404).json({ message: "Event not found" });
		}

		res.json(updatedEvent);
	} catch (error) {
		handleError(res, error, "updateEvent");
	}
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const registerForEvent = async (req: Request, res: Response) => {
const authUser = (req as any).user;
const { visitorName, email } = req.body ?? {};

const name = String(authUser ? authUser.name : visitorName ?? '').trim();
const cleanEmail = String(authUser ? authUser.email : email ?? '').trim().toLowerCase();
const rawId = String(req.params.id);

  if (!mongoose.isValidObjectId(rawId) || !name || !EMAIL_RE.test(cleanEmail)) {
    return res
      .status(400)
      .json({ success: false, message: 'Please check your details.' });
  }

  const eventId = new mongoose.Types.ObjectId(rawId);

  try {
    // Friendly message for the normal case. The unique index below is the real
    // guard, because two simultaneous requests can both pass this check.
    if (await Registration.exists({ event: eventId, email: cleanEmail })) {
      return res.status(409).json({
        success: false,
        message: 'This email is already registered for this event.',
      });
    }

    // Take one place atomically, so the last place can't be sold twice.
    const event = await Event.findOneAndUpdate(
      { _id: eventId, spotRemaining: { $gte: 1 } },
      { $inc: { spotRemaining: -1 } },
      { new: true }
    );

    if (!event) {
      const exists = await Event.exists({ _id: eventId });
      return res.status(exists ? 409 : 404).json({
        success: false,
        message: exists ? 'This event is fully booked.' : 'Event not found.',
      });
    }

    try {
      const registration = await Registration.create({
        event: eventId,
        visitorName: name,
        email: cleanEmail,
		user: authUser?._id,
      });

      return res.status(201).json({
        success: true,
        registrationId: registration.id,
        reference: registration.id.slice(-6).toUpperCase(),
        spotRemaining: event.spotRemaining,
      });
    } catch (saveErr: any) {
      // Saving failed after the place was taken, so give it back.
      await Event.updateOne({ _id: eventId }, { $inc: { spotRemaining: 1 } });

      if (saveErr?.code === 11000) {
        return res.status(409).json({
          success: false,
          message: 'This email is already registered for this event.',
        });
      }
      throw saveErr;
    }
  } catch (err) {
    console.error('registerForEvent failed:', err);
    return res
      .status(500)
      .json({ success: false, message: 'Registration failed. Please try again.' });
  }
};