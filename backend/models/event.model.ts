import mongoose from "mongoose";

export type IEvent = {
    title: string,
    description: string,
    image: string,
    start_date: Date,
    end_date: Date,
    type: string,
    capacity: number
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
        type: {
            type: String,
            enum: ["workshop", "talk", "tour"],
        },
        capacity: {
            type: Number,
            required: true,
        }
    },
    {
        timestamps: true,
    }
)

const Event = mongoose.model("Event", eventSchema);

export default Event;