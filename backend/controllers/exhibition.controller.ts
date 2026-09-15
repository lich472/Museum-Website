import Exhibition from "../models/exhibition.model.ts";
import { Request, Response } from "express";

export const getAllExhibition = async (req: Request, res: Response) => {
	try {
		const exhibitions = await Exhibition.find({}); // find all exhibition
		res.json({ exhibitions });
	} catch (error) {
		if(error instanceof Error){
			console.log("Error in getAllExhibitions controller", error.message);
			res.status(500).json({ message: "Server error", error: error.message });
		}
	}
};

export const createExhibition = async (req: Request, res: Response) => {
	try {
		const { title, description, image, start_date, end_date, status, isHighlight } = req.body;

		const exhibition = await Exhibition.create({
			title,
			description,
			image,
			start_date,
			end_date,
            status, 
            isHighlight,
		});

		res.status(201).json(exhibition);
	} catch (error) {
		if(error instanceof Error){
			console.log("Error in createExhibition controller", error.message);
			res.status(500).json({ message: "Server error", error: error.message });
		}
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
		if(error instanceof Error){
			console.log("Error in deleteExhibition controller", error.message);
			res.status(500).json({ message: "Server error", error: error.message });
		}
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
	if(error instanceof Error){
    	console.error("Error fetching exhibition:", error);
    	res.status(500).json({ message: "Error fetching exhibition", error: error.message });
	}
  }
};
