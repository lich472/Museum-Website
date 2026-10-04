import mongoose from "mongoose";

export type IExhibition = {
    title: string,
    description: string,
    imageUrl: string,
    startDate: Date,
    endDate: Date,
    status: string,
    room: string,
    tags: string[],
    isHighlight: boolean
}

const exhibitionSchema = new mongoose.Schema<IExhibition>(
    {
        title: {
            type: String,
            required: [true, "Title is required"],
        },
        description: {
            type: String,
            required: [true, "Description is required"],
        },
        imageUrl: {
            type: String,
			required: [true, "Image is required"],
        },
        startDate: {
            type: Date,
            required: true,
        },
        endDate: {
            type: Date,
            required: true,
        },
        status: {
            type: String,
			enum: ["current", "upcoming", "past"],
			default: "current",
        },
        room: {
            type: String,
            required: true,
        },
        tags: [{
            type: String,
        }],
        isHighlight: {
			type: Boolean,
			default: false,
		}
    },
    {
        timestamps: true,
    }
)

const Exhibition = mongoose.model("Exhibition", exhibitionSchema);

export default Exhibition;