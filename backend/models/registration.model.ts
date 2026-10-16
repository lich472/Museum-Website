import mongoose from "mongoose";

/**
 * A visitor's registration for a single event.
 *
 * Deliberately separate from `booking.model.ts`: that one is P2's ticketing
 * record for a paid ticket tied to a signed-in user. This is the free event
 * registration behind `POST /api/events/:id/register`, taken by a member of the
 * public who is not logged in, so the visitor's details are stored here
 * directly rather than behind a user reference.
 *
 * `numGuests` counts the person registering plus anyone they bring, matching
 * what the registration form collects.
 */
export type IRegistration = {
	event: mongoose.Schema.Types.ObjectId;
	visitorName: string;
	email: string;
	numGuests: number;
};

const registrationSchema = new mongoose.Schema<IRegistration>(
	{
		event: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Event",
			required: true,
			// Every useful query here starts from the event.
			index: true,
		},
		visitorName: {
			type: String,
			required: [true, "Visitor name is required"],
			trim: true,
		},
		email: {
			type: String,
			required: [true, "Email is required"],
			trim: true,
			lowercase: true,
		},
		numGuests: {
			type: Number,
			required: true,
			min: [1, "At least one guest is required"],
		},
	},
	{
		timestamps: true,
	}
);

const Registration = mongoose.model("Registration", registrationSchema);

export default Registration;
