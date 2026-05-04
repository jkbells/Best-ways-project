/**
 * Fare Calculation Service
 * Computes price estimate based on ambulance type, distance, and demand
 */

// Base fares (PKR) per ambulance type
const BASE_FARES = {
  basic:    500,
  als:      1200,
  icu:      2500,
  neonatal: 1800,
};

// Per-km rates (PKR)
const PER_KM_RATES = {
  basic:    80,
  als:      150,
  icu:      250,
  neonatal: 180,
};

// Equipment/service fees
const EQUIPMENT_FEES = {
  basic:    100,
  als:      400,
  icu:      800,
  neonatal: 500,
};

/**
 * Calculate fare estimate
 * @param {string} type - ambulance type
 * @param {number} distanceKm - trip distance
 * @param {boolean} isSurge - demand surge flag
 * @returns {object} full fare breakdown
 */
const calculateFare = (type, distanceKm, isSurge = false) => {
  const baseFare = BASE_FARES[type] || BASE_FARES.basic;
  const distanceFare = Math.round((PER_KM_RATES[type] || PER_KM_RATES.basic) * distanceKm);
  const equipmentFee = EQUIPMENT_FEES[type] || EQUIPMENT_FEES.basic;
  const surgeMultiplier = isSurge ? 1.3 : 1.0;
  const surgeFee = isSurge ? Math.round((baseFare + distanceFare) * 0.3) : 0;
  const total = Math.round((baseFare + distanceFare + equipmentFee + surgeFee) * surgeMultiplier / surgeMultiplier);

  return {
    baseFare,
    distanceFare,
    equipmentFee,
    surgeFee,
    surgeMultiplier,
    total,
  };
};

/**
 * Estimate distance between two lat/lng points using Haversine formula
 */
const haversineDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

module.exports = { calculateFare, haversineDistance };
