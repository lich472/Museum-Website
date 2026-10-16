import mongoose from "mongoose";

export type IEvent = {
    title: string,
    description: string,
    imageUrl: string,
    startDate: Date,
    endDate: Date,
    spotRemaining: number,
    type: string,
    capacity: number,
    location: string
}

const eventSchema = new mongoose.Schema<IEvent>(
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
        spotRemaining: {
            type: Number,
            required: true,
        },
        type: {
            type: String,
            enum: ["workshop", "talk", "tour"],
            required: true
        },
        capacity: {
            type: Number,
            required: true,
        },
        location: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true,
    }
)

const Event = mongoose.model("Event", eventSchema);

export default Event;