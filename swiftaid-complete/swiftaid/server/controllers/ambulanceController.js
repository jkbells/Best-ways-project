/**
 * Ambulance Controller
 * Handles nearby search, type listing, and price estimation
 */

const Ambulance = require('../models/Ambulance');
const { calculateFare, haversineDistance, AMBULANCE_CONFIG } = require('../services/bookingService');

/**
 * GET /api/ambulances/nearby
 * Query: { latitude, longitude, type?, radius? (km) }
 * Returns available ambulances sorted by distance
 */
exports.getNearby = async (req, res, next) => {
  try {
    const { latitude, longitude, type, radius = 10 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ success: false, message: 'latitude and longitude required' });
    }

    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);
    const radiusM = parseFloat(radius) * 1000;

    const filter = {
      status: 'available',
      isActive: true,
      currentLocation: {
        $near: {
          $geometry: { type: 'Point', coordinates: [lon, lat] },
          $maxDistance: radiusM,
        },
      },
    };
    if (type) filter.type = type;

    const ambulances = await Ambulance.find(filter).limit(20);

    // Attach calculated distance and ETA to each result
    const enriched = ambulances.map((amb) => {
      const coords = amb.currentLocation?.coordinates || [0, 0];
      const distKm = haversineDistance(lat, lon, coords[1], coords[0]);
      const etaMin = Math.max(1, Math.round(distKm * 2.5)); // ~24 km/h average speed

      return {
        ...amb.toObject(),
        distanceKm: parseFloat(distKm.toFixed(2)),
        etaMinutes: etaMin,
      };
    });

    res.status(200).json({ success: true, count: enriched.length, ambulances: enriched });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/ambulances/types
 * Returns all ambulance types with pricing info (for selection screen)
 */
exports.getTypes = async (req, res) => {
  const types = Object.entries(AMBULANCE_CONFIG).map(([key, config]) => ({
    type: key,
    ...config,
  }));
  res.status(200).json({ success: true, types });
};

/**
 * GET /api/ambulances/estimate
 * Query: { type, distanceKm }
 * Returns fare breakdown before booking
 */
exports.getFareEstimate = async (req, res) => {
  try {
    const { type, distanceKm } = req.query;
    if (!type || !distanceKm) {
      return res.status(400).json({ success: false, message: 'type and distanceKm required' });
    }
    const fare = calculateFare(type, parseFloat(distanceKm));
    res.status(200).json({ success: true, fare });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
