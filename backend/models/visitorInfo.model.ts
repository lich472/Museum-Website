import mongoose from "mongoose";

/**
 * The museum's visitor information (api-contract.md §3).
 *
 * This is one museum-wide document, not a collection: the controller always
 * reads and writes the single stored document. It exists so the accessibility
 * and facilities pages stop 404ing against this backend and falling back to
 * `backend-fallback/`.
 *
 * Every field carries a default, so the document created by the first PUT
 * already matches the contract shape in full even when that PUT only sent a
 * subset of it.
 */

export type IOpeningHours = {
	monday: string;
	tuesday: string;
	wednesday: string;
	thursday: string;
	friday: string;
	saturday: string;
	sunday: string;
	closedDates: string[];
};

export type ILocation = {
	address: string;
	lat: number;
	lng: number;
};

export type IAccessibility = {
	wheelchairAccess: boolean;
	parking: string;
	sensoryFriendlyHours: string;
};

export type IVisitorInfo = {
	openingHours: IOpeningHours;
	location: ILocation;
	accessibility: IAccessibility;
	facilities: string[];
};

// The museum-default content, used as the default value of each section. It is
// written out in full rather than left as `default: () => ({})` so that the
// document created by a partial first PUT is guaranteed to carry every section
// and every field the contract lists, instead of depending on how an empty
// object is cast into a sub-document.
const DEFAULT_OPENING_HOURS: IOpeningHours = {
	monday: "10:00–17:00",
	tuesday: "10:00–17:00",
	wednesday: "10:00–17:00",
	thursday: "10:00–17:00",
	friday: "10:00–17:00",
	saturday: "10:00–17:00",
	sunday: "Closed",
	closedDates: [],
};

/**
 * These are the museum's real values, not empty placeholders — and that matters.
 *
 * `GET /api/visitor-info` answers with this document, and the two pages that read
 * it fall back to the copy bundled in the frontend only when the REQUEST fails.
 * Empty defaults therefore did not read as "nothing configured yet": they
 * replaced live content. `facilities: []` in particular wiped the whole
 * facilities page, because the page reads `info.facilities || []` and an empty
 * array is a value — no facility cards and no facility markers on the plan.
 * Accessibility likewise showed a disabled wheelchair and blank parking and
 * sensory hours.
 *
 * Kept identical to `frontend/src/data/visitorInfo.js` and to
 * `backend-fallback/server.js`, which serve the same facts.
 */
const DEFAULT_LOCATION: ILocation = {
	address: "123 Main St, Adelaide SA",
	lat: -34.9285,
	lng: 138.6007,
};

const DEFAULT_ACCESSIBILITY: IAccessibility = {
	wheelchairAccess: true,
	parking: "Free onsite parking, 2 accessible bays",
	sensoryFriendlyHours: "First Tuesday of the month, 9:00–10:00",
};

// `_id: false` on the three sub-schemas: the contract describes nested objects,
// and a generated _id per section would leak fields the frontend never asked
// for.
const openingHoursSchema = new mongoose.Schema<IOpeningHours>(
	{
		monday: { type: String, default: DEFAULT_OPENING_HOURS.monday },
		tuesday: { type: String, default: DEFAULT_OPENING_HOURS.tuesday },
		wednesday: { type: String, default: DEFAULT_OPENING_HOURS.wednesday },
		thursday: { type: String, default: DEFAULT_OPENING_HOURS.thursday },
		friday: { type: String, default: DEFAULT_OPENING_HOURS.friday },
		saturday: { type: String, default: DEFAULT_OPENING_HOURS.saturday },
		sunday: { type: String, default: DEFAULT_OPENING_HOURS.sunday },
		closedDates: { type: [String], default: () => [...DEFAULT_OPENING_HOURS.closedDates] },
	},
	{ _id: false }
);

const locationSchema = new mongoose.Schema<ILocation>(
	{
		address: { type: String, default: DEFAULT_LOCATION.address },
		lat: { type: Number, default: DEFAULT_LOCATION.lat },
		lng: { type: Number, default: DEFAULT_LOCATION.lng },
	},
	{ _id: false }
);

const accessibilitySchema = new mongoose.Schema<IAccessibility>(
	{
		wheelchairAccess: { type: Boolean, default: DEFAULT_ACCESSIBILITY.wheelchairAccess },
		parking: { type: String, default: DEFAULT_ACCESSIBILITY.parking },
		sensoryFriendlyHours: { type: String, default: DEFAULT_ACCESSIBILITY.sensoryFriendlyHours },
	},
	{ _id: false }
);

const visitorInfoSchema = new mongoose.Schema<IVisitorInfo>(
	{
		openingHours: { type: openingHoursSchema, default: () => ({ ...DEFAULT_OPENING_HOURS }) },
		location: { type: locationSchema, default: () => ({ ...DEFAULT_LOCATION }) },
		accessibility: { type: accessibilitySchema, default: () => ({ ...DEFAULT_ACCESSIBILITY }) },
		facilities: {
		type: [String],
		// Never empty: an empty list erases the facilities page rather than
		// meaning "none configured", because the page's `info.facilities || []`
		// keeps an empty array.
		default: ["Café", "Gift Shop", "Restrooms", "Cloakroom"],
	},
	},
	{
		timestamps: true,
	}
);

const VisitorInfo = mongoose.model<IVisitorInfo>("VisitorInfo", visitorInfoSchema);

export default VisitorInfo;
