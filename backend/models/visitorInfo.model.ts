
import mongoose, { Schema } from 'mongoose'

const visitorInfoSchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: 'museum',
    },

    openingHours: {
      monday: { type: String, default: '10:00–17:00' },
      tuesday: { type: String, default: '10:00–17:00' },
      wednesday: { type: String, default: '10:00–17:00' },
      thursday: { type: String, default: '10:00–17:00' },
      friday: { type: String, default: '10:00–17:00' },
      saturday: { type: String, default: '10:00–17:00' },
      sunday: { type: String, default: 'Closed' },
    },

    closedDates: {
      type: String,
      default: '2026-12-25',
    },

    address: {
      type: String,
      default: '123 Main St, Adelaide SA',
    },

    latitude: {
      type: Number,
      default: -34.9285,
    },

    longitude: {
      type: Number,
      default: 138.6007,
    },

    wheelchairAccess: {
      type: Boolean,
      default: true,
    },

    parking: {
      type: String,
      default: 'Free onsite parking, 2 accessible bays',
    },

    sensoryFriendlyHours: {
      type: String,
      default: 'First Tuesday of the month, 9:00–10:00',
    },

    facilities: {
      type: String,
      default: 'Café, Gift Shop, Restrooms, Cloakroom',
    },
  },
  {
    timestamps: true,
  }
)

const VisitorInfo = mongoose.model(
  'VisitorInfo',
  visitorInfoSchema
)

export default VisitorInfo
