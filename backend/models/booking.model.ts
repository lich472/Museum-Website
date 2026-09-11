import { Timestamp } from "mongodb";
import mongoose from "mongoose"; 

type IBooking = {
    userId: mongoose.Schema.Types.ObjectId,
    eventId: mongoose.Schema.Types.ObjectId,
    date: Date,
    time: Timestamp,
    numVisitor: number
}

const bookingSchema = new mongoose.Schema<IBooking>(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref:"User",
            required: true
        },

        eventId: {
            type: mongoose.Schema.Types.ObjectId,
            ref:"Event",
            required: true
        },
        date: {
            type: Date,
            required: true
        },
        time: {
            type: Timestamp,
            required: true
        },
        numVisitor: {
            type: Number,
            required: true
        },
    },
    {
        timestamps: true
    }
)

/* TODO: dont know exhibition_id/event_id or both
dont know "reference_number, status" can I ignore them ?
*/

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;