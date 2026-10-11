import mongoose from "mongoose";
import { Request, Response } from "express";
import Exhibition from "../models/exhibition.model.ts";

/** How many recommendations to return (when the museum has that many). */
const MAX_RECOMMENDATIONS = 4;

/**
 * A recommended exhibition: the stored document, plus how many topics it shares
 * with the exhibition being viewed. The shared-* fields are present only on
 * topic matches, not on id-ordered fillers.
 */
type RecommendationItem = {
	_id: mongoose.Types.ObjectId;
	title: string;
	description: string;
	imageUrl: string;
	startDate: Date;
	endDate: Date;
	status: string;
	room: string;
	tags: string[];
	isHighlight: boolean;
	sharedTags?: string[];
	sharedCount?: number;
};

/**
 * GET /api/recommendations?exhibitionId=<id>
 *
 * Returns up to four other exhibitions for the "you might also like" section,
 * so the section is always full while the museum has enough exhibitions.
 *
 * 1. Topic matches come first, ranked by how many tags they share with the
 *    exhibition being viewed. `tags` is the closest thing the Exhibition schema
 *    has to a category.
 * 2. If fewer than four matched, the remainder is filled with the lowest ids
 *    (`_id` ascending, i.e. oldest first) that are not already listed.
 *
 * Both rules exclude the exhibition you are already looking at.
 *
 * The path and query parameter deliberately match Jason_P5's server in
 * `backend-fallback/`, so the two backends stay interchangeable from the
 * frontend's point of view (see `frontend/src/api/client.js`).
 */
export const getRecommendations = async (req: Request, res: Response) => {
	try {
		const { exhibitionId } = req.query;

		if (typeof exhibitionId !== "string" || exhibitionId.length === 0) {
			return res
				.status(400)
				.json({ message: "exhibitionId query param required" });
		}

		if (!mongoose.isValidObjectId(exhibitionId)) {
			return res
				.status(400)
				.json({ message: "exhibitionId is not a valid exhibition id" });
		}

		const current = await Exhibition.findById(exhibitionId).lean();

		if (!current) {
			return res.status(404).json({ message: "Exhibition not found" });
		}

		const currentTags = current.tags ?? [];

		// Step 1: exhibitions sharing at least one topic, best match first. The
		// query already guarantees one shared tag; the count then decides rank.
		const matching: RecommendationItem[] =
			currentTags.length === 0
				? []
				: (
						await Exhibition.find({
							_id: { $ne: current._id },
							tags: { $in: currentTags },
						}).lean()
				  )
						.map((candidate) => {
							const sharedTags = (candidate.tags ?? []).filter((tag) =>
								currentTags.includes(tag)
							);
							return {
								...candidate,
								sharedTags,
								sharedCount: sharedTags.length,
							};
						})
						.sort((a, b) => b.sharedCount - a.sharedCount)
						.slice(0, MAX_RECOMMENDATIONS);

		// Step 2: top up with the lowest ids that are not already listed and are
		// not the exhibition being viewed.
		if (matching.length < MAX_RECOMMENDATIONS) {
			const alreadyListed = [current._id, ...matching.map((item) => item._id)];

			const fillers = await Exhibition.find({ _id: { $nin: alreadyListed } })
				.sort({ _id: 1 })
				.limit(MAX_RECOMMENDATIONS - matching.length)
				.lean();

			matching.push(...fillers);
		}

		res.json({ recommendations: matching });
	} catch (error) {
		if (error instanceof Error) {
			console.log("Error in getRecommendations controller", error.message);
			res.status(500).json({ message: "Server error", error: error.message });
		}
	}
};
