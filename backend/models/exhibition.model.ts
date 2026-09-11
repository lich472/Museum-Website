import mongoose from "mongoose";

export type IExhibition = {
    title: string,
    description: string,
    image: string,
    start_date: Date,
    end_date: Date,
    status: string,
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
        image: {
            type: String,
			required: [true, "Image is required"],
        },
        start_date: {
            type: Date,
            required: true,
        },
        end_date: {
            type: Date,
            required: true,
        },
        status: {
            type: String,
			enum: ["current", "upcoming", "past"],
			default: "current",
        },
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