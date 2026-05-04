/**
 * Pricing Service
 * Fare calculation logic based on ambulance type and distance
 */

const PRICING = {
  basic:    { baseFare: 500,  perKmRate: 80,  equipmentCharge: 90  },
  als:      { baseFare: 1200, perKmRate: 120, equipmentCharge: 200 },
  icu:      { baseFare: 2500, perKmRate: 180, equipmentCharge: 400 },
  neonatal: { baseFare: 1800, perKmRate: 150, equipmentCharge: 300 },
};

/**
 * Calculate straight-line distance between two coordinate pairs (km)
 * Uses Haversine formula
 */
const calculateDistance = (pickup, destination) => {
  const { latitude: lat1, longitude: lon1 } = pickup;
  const { latitude: lat2, longitude: lon2 } = destination;

  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  const distKm = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  // Add 20% buffer for road distance vs straight-line
  return Math.round(distKm * 1.2 * 10) / 10;
};

/**
 * Calculate fare breakdown
 */
const calculateFare = (ambulanceType, distanceKm, surgeFactor = 1.0) => {
  const pricing = PRICING[ambulanceType] || PRICING.basic;

  const baseFare        = pricing.baseFare;
  const distanceFare    = Math.round(pricing.perKmRate * distanceKm);
  const equipmentCharge = pricing.equipmentCharge;
  const subtotal        = baseFare + distanceFare + equipmentCharge;
  const total           = Math.round(subtotal * surgeFactor);

  return {
    baseFare,
    distanceFare,
    equipmentCharge,
    surgeFactor,
    total,
  };
};

/**
 * Get surge factor based on time and demand (simplified)
 */
const getSurgeFactor = () => {
  const hour = new Date().getHours();
  // Higher surge during peak emergency hours (midnight - 6am)
  if (hour >= 0 && hour < 6) return 1.2;
  return 1.0;
};

module.exports = { calculateDistance, calculateFare, getSurgeFactor, PRICING };
