import Event from "../models/event.model.ts";
import { Request, Response } from "express";

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
