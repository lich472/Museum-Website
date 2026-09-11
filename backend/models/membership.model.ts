import mongoose from "mongoose";

type IMembership = {
    userId: mongoose.Schema.Types.ObjectId,
    start_date: Date,
    renewal_date: Date,
    status: string,
    plan_type: string
}

const membershipSchema = new mongoose.Schema<IMembership>(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        start_date: {
            type: Date,
            required: true
        },
        renewal_date: {
            type: Date,
            required: true
        },
        status: {
            type: String,
            enum: ["active", "expired", "cancelled"]
        },
        plan_type: {
            type: String,
            enum: ["free", "premium"],
            default: "free"
        }   
    },
    {timestamps: true}
)

const Membership = mongoose.model("Membership", membershipSchema);

export default Membership;