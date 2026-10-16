import Event from "../models/event.model.ts";
import { Request, Response } from "express";

export const getAllEvent = async (req: Request, res: Response) => {
	try {
		const events = await Event.find({}); // find all Event
		res.json({ events });
	} catch (error) {
		if(error instanceof Error){
			console.log("Error in getAllEvent controller", error.message);
			res.status(500).json({ message: "Server error", error: error.message });
		}
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
		if(error instanceof Error){
			console.log("Error in createEvent controller", error.message);
			res.status(500).json({ message: "Server error", error: error.message });
		}
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
		if(error instanceof Error){
			console.log("Error in deleteEvent controller", error.message);
			res.status(500).json({ message: "Server error", error: error.message });
		}
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
	if(error instanceof Error){
    	console.error("Error fetching event:", error);
    	res.status(500).json({ message: "Error fetching event", error: error.message });
	}
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
			{ new: true } 
		);

		if (!updatedEvent) {
			return res.status(404).json({ message: "Event not found" });
		}

		res.json(updatedEvent);
	} catch (error) {
		if (error instanceof Error) {
			console.log("Error in updateEvent controller", error.message);
			res.status(500).json({ message: "Server error", error: error.message });
		}
	}
};