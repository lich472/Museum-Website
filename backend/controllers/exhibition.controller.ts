import Exhibition from "../models/exhibition.model.ts";
import { Request, Response } from "express";

/**
 * Same mapping as `collection.controller.ts`: caller mistakes (ValidationError,
 * CastError) become 400 with a generic message; anything else is logged and
 * reported as a generic 500 instead of leaking the Mongoose message to
 * unauthenticated callers.
 */
function handleError(res: Response, error: any, label: string) {
	if (error?.name === "ValidationError") {
		return res.status(400).json({ message: error.message });
	}
	if (error?.name === "CastError") {
		return res.status(400).json({ message: "Invalid exhibition id" });
	}
	console.error(`${label} error:`, error);
	return res.status(500).json({ message: "Server error" });
}

export const getAllExhibition = async (req: Request, res: Response) => {
	try {
		const exhibitions = await Exhibition.find({}); // find all exhibition
		res.json({ exhibitions });
	} catch (error) {
		handleError(res, error, "getAllExhibition");
	}
};

export const createExhibition = async (req: Request, res: Response) => {
	try {
		const { title, description, imageUrl, startDate, endDate, status, room, tags, isHighlight } = req.body;

		const exhibition = await Exhibition.create({
			title,
			description,
			imageUrl,
			startDate,
			endDate,
            status, 
			room,
			tags,
            isHighlight,
		});

		res.status(201).json(exhibition);
	} catch (error) {
		handleError(res, error, "createExhibition");
	}
};

export const deleteExhibition = async (req: Request, res: Response) => {
	try {
		const exhibition = await Exhibition.findById(req.params.id);

		if (!exhibition) {
			return res.status(404).json({ message: "Exhibition not found" });
		}

		await Exhibition.findByIdAndDelete(req.params.id);

		res.json({ message: "Exhibition deleted successfully" });
	} catch (error) {
		handleError(res, error, "deleteExhibition");
	}
};

export const getExhibitionById = async (req: Request, res: Response) => {
  try {
    const exhibition = await Exhibition.findById(req.params.id);

    if (!exhibition) {
      return res.status(404).json({ message: "Exhibition not found" });
    }

    res.status(200).json(exhibition);
  } catch (error) {
	handleError(res, error, "getExhibitionById");
  }
};

export const updateExhibition = async (req: Request, res: Response) => {
	try {
		const { title, description, imageUrl, startDate, endDate, status, room, tags, isHighlight } = req.body;

		// Find the item by ID and pass the updated body values
		const updatedExhibition = await Exhibition.findByIdAndUpdate(
			req.params.id,
			{ title, description, imageUrl, startDate, endDate, status, room, tags, isHighlight },
			// runValidators: without it Mongoose skipped enum/required checking on
			// update, so the status values the admin UI sends ("Upcoming", "Live",
			// "Archived") were stored even though the schema only allows
			// "current"/"upcoming"/"past".
			{ new: true, runValidators: true } // 'new: true' tells Mongoose to return the modified document instead of the original
		);

		if (!updatedExhibition) {
			return res.status(404).json({ message: "Exhibition not found" });
		}

		res.json(updatedExhibition);
	} catch (error) {
		handleError(res, error, "updateExhibition");
	}
};
