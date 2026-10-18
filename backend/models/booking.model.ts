import mongoose from "mongoose";

type IBooking = {
  reference: string;
  requestId: string;
  date: string;
  quantities: { adult: number; child: number; concession: number; infant: number };
  details: {
    firstName: string;
    lastName: string;
    email: string;
    dialCode: string;
    phone: string;
    australianResident: boolean;
    postcode: string;
    marketingConsent: boolean;
    acceptedTerms: boolean;
  };
  totalCents: number;
  status: "confirmed" | "cancelled";
};

const bookingSchema = new mongoose.Schema(
  {
    reference: { 
        type: String, 
        required: true, 
        unique: true },
    requestId: { 
        type: String, 
        required: true, 
        unique: true }, // stops double-submits
    date: { 
        type: String, 
        required: true }, // "2026-11-05", kept as a string on purpose
    quantities: {
      adult: { 
        type: Number, 
        default: 0, 
        min: 0, 
        max: 20 },
      child: { 
        type: Number, 
        default: 0, 
        min: 0, 
        max: 20 
      },
      concession: { 
        type: Number, 
        default: 0, 
        min: 0, 
        max: 20 
      },
      infant: { 
        type: Number, 
        default: 0, 
        min: 0, 
        max: 20 
      },
    },
    details: {
      firstName: { 
        type: String, 
        required: true, 
        trim: true 
      },
      lastName: { 
        type: String, 
        required: true, 
        trim: true 
      },
      email: { 
        type: String, 
        required: true, 
        trim: true, 
        lowercase: true 
      },
      dialCode: { 
        type: String, 
        required: true 
      },
      phone: { 
        type: String, 
        required: true, 
        trim: true 
      },
      australianResident: { 
        type: Boolean, 
        required: true 
      },
      postcode: { 
        type: String, 
        default: "" 
      }, // empty if not an Australian resident
      marketingConsent: { 
        type: Boolean, 
        default: false 
      },
      acceptedTerms: { 
        type: Boolean, 
        required: true 
      },
    },
    totalCents: { 
      type: Number, 
      required: true, 
      min: 0 
    },
    status: { 
      type: String, 
      enum: ["confirmed", "cancelled"], 
      default: "confirmed" 
    },
  },
  { timestamps: true }
);

export default mongoose.model("Booking", bookingSchema);