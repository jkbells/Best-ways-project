/**
 * Ambulance Model
 * Represents a vehicle/driver unit with real-time location and availability
 */

const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  type: { type: String, enum: ['Point'], default: 'Point' },
  coordinates: { type: [Number], default: [0, 0] }, // [longitude, latitude]
});

const ambulanceSchema = new mongoose.Schema(
  {
    vehicleNumber: { type: String, required: true, unique: true, uppercase: true },
    type: {
      type: String,
      required: true,
      enum: ['basic', 'als', 'icu', 'neonatal'],
      // basic = Basic Ambulance, als = Advanced Life Support
      // icu = Intensive Care Unit, neonatal = Neonatal
    },

    // Driver/Paramedic info
    driver: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      licenseNumber: String,
      rating: { type: Number, default: 4.8, min: 1, max: 5 },
      totalRides: { type: Number, default: 0 },
      avatar: String,
    },

    // Equipment carried
    equipment: [String], // e.g. ['Oxygen', 'Defibrillator', 'Stretcher']

    // Pricing (per km in PKR)
    pricing: {
      baseFare: { type: Number, required: true },
      perKm: { type: Number, required: true },
      equipmentCharge: { type: Number, default: 0 },
    },

    // Real-time state
    status: {
      type: String,
      enum: ['available', 'busy', 'offline'],
      default: 'available',
    },
    currentLocation: { type: locationSchema, index: '2dsphere' },
    socketId: String, // active socket connection for real-time updates

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Geospatial index for nearby queries
ambulanceSchema.index({ currentLocation: '2dsphere' });

module.exports = mongoose.model('Ambulance', ambulanceSchema);
