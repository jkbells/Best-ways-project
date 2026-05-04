/**
 * Booking Model
 * Full lifecycle of an ambulance booking from creation to completion
 */

const mongoose = require('mongoose');

const coordinateSchema = new mongoose.Schema({
  latitude: Number,
  longitude: Number,
  address: String,
});

const bookingSchema = new mongoose.Schema(
  {
    // References
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ambulance: { type: mongoose.Schema.Types.ObjectId, ref: 'Ambulance' },

    // Locations
    pickup: { type: coordinateSchema, required: true },
    destination: { type: coordinateSchema, required: true },

    // Patient details
    patient: {
      name: { type: String, required: true },
      condition: {
        type: String,
        enum: ['critical', 'moderate', 'stable'],
        default: 'moderate',
      },
      notes: String,
      passengerCount: { type: Number, default: 1 },
    },

    // Ambulance selection
    ambulanceType: {
      type: String,
      enum: ['basic', 'als', 'icu', 'neonatal'],
      required: true,
    },

    // Trip lifecycle
    status: {
      type: String,
      enum: [
        'searching',   // Looking for driver
        'accepted',    // Driver accepted
        'arriving',    // Driver en route to pickup
        'arrived',     // Driver at pickup
        'in_progress', // Trip underway
        'completed',   // Trip done
        'cancelled',   // Cancelled by user/driver
        'no_drivers',  // No drivers available
      ],
      default: 'searching',
    },

    // Timestamps for each status transition
    timeline: {
      searchedAt: { type: Date, default: Date.now },
      acceptedAt: Date,
      arrivedAt: Date,
      startedAt: Date,
      completedAt: Date,
      cancelledAt: Date,
    },

    // Pricing
    fare: {
      baseFare: Number,
      distanceCharge: Number,
      equipmentCharge: Number,
      surgeFactor: { type: Number, default: 1.0 },
      total: Number,
    },

    // Distance in km
    distanceKm: Number,
    estimatedDurationMin: Number,

    // Payment
    payment: {
      method: {
        type: String,
        enum: ['cash', 'card', 'easypaisa', 'jazzcash'],
        default: 'cash',
      },
      status: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending',
      },
      transactionId: String,
      paidAt: Date,
    },

    // Emergency flag (one-tap SOS booking)
    isEmergency: { type: Boolean, default: false },

    // Rating
    rating: {
      score: { type: Number, min: 1, max: 5 },
      tags: [String],
      comment: String,
      ratedAt: Date,
    },

    cancellationReason: String,
  },
  { timestamps: true }
);

// Virtual: booking reference ID (human readable)
bookingSchema.virtual('bookingRef').get(function () {
  return `SA-${this._id.toString().slice(-6).toUpperCase()}`;
});

bookingSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Booking', bookingSchema);
