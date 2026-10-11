import Event from "../models/event.model.ts";
import { Request, Response } from "express";

export const getAllEvent = async (req: Request, res: Response) => {
	try {
		const event = await Event.find({}); // find all exhibition
		res.json({ event });
	} catch (error) {
		if(error instanceof Error){
			console.log("Error in getAllEvent controller", error.message);
			res.status(500).json({ message: "Server error", error: error.message });
		}
	}
};

export const createEvent = async (req: Request, res: Response) => {
	try {
		const { title, description, image, start_date, end_date, type, capacity } = req.body;

		const event = await Event.create({
			title,
			description,
			image,
			start_date,
			end_date,
            type, 
            capacity,
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
