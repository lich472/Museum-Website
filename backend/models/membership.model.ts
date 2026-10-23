import mongoose from "mongoose";

const membershipSchema = new mongoose.Schema(
  {
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true, 
        index: true 
    },
    requestId: { 
        type: String, 
        required: true, 
        unique: true 
    }, // blocks double-submits
    reference: { 
        type: String, 
        required: true, 
        unique: true 
    },
    cents: { 
        type: Number, 
        required: true, 
        min: 0 
    },
    startsAt: { 
        type: Date, 
        required: true 
    },
    expiresAt: { 
        type: Date, 
        required: true 
    },
    status: { 
        type: String, 
        enum: ["active", "cancelled"], 
        default: "active" },
    cancelledAt: { 
        type: Date 
    },
  },
  { timestamps: true }
);

export default mongoose.model("Membership", membershipSchema);