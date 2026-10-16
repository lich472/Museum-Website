import { Request, Response } from "express";
import VisitorInfo from "../models/visitorInfo.model.ts";

/**
 * The same mapping `collection.controller.ts` uses: bad input is the caller's
 * fault, not the server's. Without this a CastError from a malformed id or a
 * ValidationError from a bad body was reported as 500 and leaked the Mongoose
 * message to the caller.
 */
function handleError(res: Response, error: any, label: string) {
	if (error?.name === "ValidationError") {
		return res.status(400).json({ message: error.message });
	}
	if (error?.name === "CastError") {
		return res.status(400).json({ message: "Invalid visitor info id" });
	}
	console.error(`${label} error:`, error);
	return res.status(500).json({ message: "Server error" });
}

/** True for a plain JSON object — an array or null is not one. */
function isPlainObject(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * GET /api/visitor-info
 *
 * Public: the accessibility and facilities pages read it without signing in.
 * Returns the single museum-wide document in the shape api-contract.md §3
 * describes.
 *
 * It answers with the schema's defaults rather than 404 when no document has
 * been created yet. A 404 was wrong twice over: this is one museum-wide object
 * that always has a value, and the frontend reads a failed request as "the
 * backend is down" — so every visit to /accessibility and /facilities logged an
 * error and fell back to the copy bundled in the app even though the backend was
 * answering perfectly well.
 */
export const getVisitorInfo = async (req: Request, res: Response) => {
	try {
		const info = await VisitorInfo.findOne().lean();

		// `new VisitorInfo()` carries the same full defaults the schema declares,
		// and toObject() hands them over as a plain object the way lean() would.
		res.status(200).json(info ?? new VisitorInfo().toObject());
	} catch (error) {
		handleError(res, error, "getVisitorInfo");
	}
};

/**
 * PUT /api/visitor-info
 *
 * Staff only (guarded at the route). The body may contain any subset of the
 * four sections. A section that is sent is merged key by key into the stored
 * one, so sending `{ "openingHours": { "sunday": "Closed" } }` changes Sunday
 * and leaves the other days alone; sections that are not sent are untouched.
 * `facilities` is the exception — it is an array and is replaced wholesale.
 *
 * The first PUT on an empty database creates the single document. The model
 * defaults fill in the sections such a partial body omitted, so the response
 * always matches the contract shape.
 */
export const updateVisitorInfo = async (req: Request, res: Response) => {
	try {
		const body = req.body ?? {};
		const { openingHours, location, accessibility, facilities } = body;

		// Type-check each section before touching the database, so a malformed
		// body is answered with a 400 that names the problem instead of a
		// Mongoose cast error surfacing later as a 500.
		if (openingHours !== undefined && !isPlainObject(openingHours)) {
			return res.status(400).json({ message: "openingHours must be an object" });
		}
		if (location !== undefined && !isPlainObject(location)) {
			return res.status(400).json({ message: "location must be an object" });
		}
		if (accessibility !== undefined && !isPlainObject(accessibility)) {
			return res.status(400).json({ message: "accessibility must be an object" });
		}
		if (
			facilities !== undefined &&
			(!Array.isArray(facilities) ||
				facilities.some((facility) => typeof facility !== "string"))
		) {
			return res
				.status(400)
				.json({ message: "facilities must be an array of strings" });
		}

		const existing = await VisitorInfo.findOne();

		if (!existing) {
			const created = await VisitorInfo.create({
				openingHours,
				location,
				accessibility,
				facilities,
			});

			return res.status(201).json(created);
		}

		// Only the sections that were actually sent are set, and each is merged
		// into the stored one key by key, so a PUT that sends only part of a
		// section keeps the rest instead of blanking it. The plain object from
		// toObject() is used because spreading a Mongoose sub-document would
		// copy its internals.
		const current = existing.toObject();

		const update: Record<string, unknown> = {};
		if (openingHours !== undefined) {
			update.openingHours = { ...current.openingHours, ...openingHours };
		}
		if (location !== undefined) {
			update.location = { ...current.location, ...location };
		}
		if (accessibility !== undefined) {
			update.accessibility = { ...current.accessibility, ...accessibility };
		}
		// An array is replaced rather than merged: merging would make removing a
		// facility impossible.
		if (facilities !== undefined) update.facilities = facilities;

		const updated = await VisitorInfo.findOneAndUpdate(
			{ _id: existing._id },
			{ $set: update },
			// runValidators so the enum/required style rules in the schema are
			// applied on update, not only on create.
			{ new: true, runValidators: true }
		);

		res.status(200).json(updated);
	} catch (error) {
		handleError(res, error, "updateVisitorInfo");
	}
};
