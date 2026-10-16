import mongoose from "mongoose"; 

type IBooking = {
    userId: mongoose.Schema.Types.ObjectId,
    eventId: mongoose.Schema.Types.ObjectId,
    date: Date,
    time: Date,
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
            // Was the BSON Timestamp class from "mongodb", which is not a
            // Mongoose SchemaType: compiling the model threw "Invalid schema
            // configuration" and nothing that imported Booking could load.
            // The "time" of a booking is a clock value, so Date is the type
            // that actually fits.
            type: Date,
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