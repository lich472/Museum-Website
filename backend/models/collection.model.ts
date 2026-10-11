import mongoose from "mongoose";

export type ICollection = {
    title: string,
    imageUrl: string,
    category: string,
    period: string,
    origin: string,
    description: string,
}

const collectionSchema = new mongoose.Schema<ICollection>(
    {
        title: {
            type: String,
            required: [true, "Title is required"],
        },
        imageUrl: {
            type: String,
            required: [true, "Image is required"],
        },
        category: {
            type: String,
            required: true
        },
        period: {
            type: String,
        },
        origin: {
            type: String,
        },
        description: {
            type: String,
            required: [true, "Description is required"],
        }
    },
    {
        timestamps: true,
    }
)

const Collection = mongoose.model("Collection", collectionSchema);

export default Collection;