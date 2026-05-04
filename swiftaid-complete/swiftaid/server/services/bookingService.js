/**
 * Booking Service
 * Core business logic: fare calculation, driver matching, trip management
 */

const Booking = require('../models/Booking');
const Ambulance = require('../models/Ambulance');

// ─── Fare Configuration ───────────────────────────────────────────────────────
const AMBULANCE_CONFIG = {
  basic:    { label: 'Basic Ambulance',         baseFare: 500,  perKm: 50,  equipment: 90  },
  als:      { label: 'Advanced Life Support',   baseFare: 1000, perKm: 100, equipment: 300 },
  icu:      { label: 'ICU Ambulance',           baseFare: 2000, perKm: 150, equipment: 800 },
  neonatal: { label: 'Neonatal Ambulance',      baseFare: 1500, perKm: 120, equipment: 500 },
};

/**
 * Haversine formula — straight-line distance between two GPS coordinates (km)
 */
const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

/**
 * Calculate fare estimate for a booking
 */
const calculateFare = (ambulanceType, distanceKm, surgeFactor = 1.0) => {
  const config = AMBULANCE_CONFIG[ambulanceType];
  if (!config) throw new Error('Invalid ambulance type');

  const baseFare = config.baseFare;
  const distanceCharge = Math.round(distanceKm * config.perKm);
  const equipmentCharge = config.equipment;
  const subtotal = baseFare + distanceCharge + equipmentCharge;
  const total = Math.round(subtotal * surgeFactor);

  return { baseFare, distanceCharge, equipmentCharge, surgeFactor, total };
};

/**
 * Find the nearest available ambulance of a given type
 * Uses MongoDB $near geospatial query
 */
const findNearestAmbulance = async (ambulanceType, pickupLat, pickupLon, maxDistanceKm = 15) => {
  const ambulance = await Ambulance.findOne({
    type: ambulanceType,
    status: 'available',
    isActive: true,
    currentLocation: {
      $near: {
        $geometry: { type: 'Point', coordinates: [pickupLon, pickupLat] },
        $maxDistance: maxDistanceKm * 1000, // meters
      },
    },
  });
  return ambulance;
};

/**
 * Create a new booking and attempt driver matching
 */
const createBooking = async (bookingData) => {
  const {
    userId, pickup, destination, ambulanceType,
    patient, paymentMethod, isEmergency,
  } = bookingData;

  // Calculate distance and fare
  const distanceKm = parseFloat(
    haversineDistance(
      pickup.latitude, pickup.longitude,
      destination.latitude, destination.longitude
    ).toFixed(2)
  );

  // Simulate surge pricing (20% chance of 1.2x surge)
  const surgeFactor = Math.random() < 0.2 ? 1.2 : 1.0;
  const fare = calculateFare(ambulanceType, distanceKm, surgeFactor);
  const estimatedDurationMin = Math.round(distanceKm * 2.5); // rough estimate

  // Create booking record
  const booking = await Booking.create({
    user: userId,
    pickup,
    destination,
    ambulanceType,
    patient,
    distanceKm,
    estimatedDurationMin,
    fare,
    payment: { method: paymentMethod || 'cash' },
    isEmergency: isEmergency || false,
    status: 'searching',
  });

  // Attempt to find & assign a driver
  const ambulance = await findNearestAmbulance(
    ambulanceType, pickup.latitude, pickup.longitude
  );

  if (ambulance) {
    booking.ambulance = ambulance._id;
    booking.status = 'accepted';
    booking.timeline.acceptedAt = new Date();
    await booking.save();

    // Mark ambulance as busy
    ambulance.status = 'busy';
    await ambulance.save();
  } else {
    booking.status = 'no_drivers';
    await booking.save();
  }

  return await Booking.findById(booking._id)
    .populate('user', 'name phone')
    .populate('ambulance');
};

/**
 * Update booking status through its lifecycle
 */
const updateBookingStatus = async (bookingId, newStatus, userId) => {
  const booking = await Booking.findOne({ _id: bookingId, user: userId });
  if (!booking) throw new Error('Booking not found');

  const now = new Date();
  const transitions = {
    arriving:    { field: null },
    arrived:     { field: 'arrivedAt' },
    in_progress: { field: 'startedAt' },
    completed:   { field: 'completedAt' },
    cancelled:   { field: 'cancelledAt' },
  };

  if (!transitions[newStatus]) throw new Error('Invalid status transition');

  booking.status = newStatus;
  const timeField = transitions[newStatus].field;
  if (timeField) booking.timeline[timeField] = now;

  // Free up ambulance if trip ended
  if (['completed', 'cancelled'].includes(newStatus) && booking.ambulance) {
    await Ambulance.findByIdAndUpdate(booking.ambulance, { status: 'available' });

    if (newStatus === 'completed') {
      await Ambulance.findByIdAndUpdate(booking.ambulance, {
        $inc: { 'driver.totalRides': 1 },
      });
      // Mark payment as paid for non-cash (mock)
      if (booking.payment.method !== 'cash') {
        booking.payment.status = 'paid';
        booking.payment.paidAt = now;
      }
    }
  }

  await booking.save();
  return Booking.findById(bookingId).populate('ambulance');
};

module.exports = {
  calculateFare,
  createBooking,
  updateBookingStatus,
  haversineDistance,
  AMBULANCE_CONFIG,
};
