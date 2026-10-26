import mongoose, { Schema, Types } from 'mongoose';

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
export interface IRegistration {
  event: Types.ObjectId;
  user?: Types.ObjectId;
  visitorName: string;
  email: string;
}

const registrationSchema = new mongoose.Schema<IRegistration>(
	{
		event: {
			type: Schema.Types.ObjectId,
			ref: "Event",
			required: true,
			// Every useful query here starts from the event.
			index: true,
		},
		user: { 
			type: Schema.Types.ObjectId, 
			ref: 'User' 
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
		}
	},
	{
		timestamps: true,
	}
);

// One registration per email per event; the controller turns error 11000 into a 409.
registrationSchema.index({ event: 1, email: 1 }, { unique: true });


const Registration = mongoose.model<IRegistration>('Registration', registrationSchema);

export default Registration;
