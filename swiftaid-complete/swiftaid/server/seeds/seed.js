/**
 * Database Seed Script
 * Populates MongoDB with realistic test data for development
 * Run: node seeds/seed.js
 */

require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const Ambulance = require('../models/Ambulance');
const User = require('../models/User');

// Jhelum, Punjab coordinates + surroundings
const BASE_LAT = 32.9425;
const BASE_LON = 73.7257;

const randomOffset = (range = 0.05) => (Math.random() - 0.5) * range * 2;

const MOCK_AMBULANCES = [
  {
    vehicleNumber: 'JAB-447',
    type: 'basic',
    driver: { name: 'Ahmad Hassan', phone: '+92-300-1111111', rating: 4.9, totalRides: 842 },
    equipment: ['Oxygen Tank', 'Stretcher', 'First Aid Kit', 'Spine Board'],
    pricing: { baseFare: 500, perKm: 50, equipmentCharge: 90 },
    status: 'available',
  },
  {
    vehicleNumber: 'JAB-219',
    type: 'basic',
    driver: { name: 'Rizwan Shah', phone: '+92-300-2222222', rating: 4.7, totalRides: 620 },
    equipment: ['Oxygen Tank', 'Stretcher', 'First Aid Kit'],
    pricing: { baseFare: 500, perKm: 50, equipmentCharge: 90 },
    status: 'available',
  },
  {
    vehicleNumber: 'JAB-881',
    type: 'als',
    driver: { name: 'Dr. Kamran Ali', phone: '+92-300-3333333', rating: 4.95, totalRides: 1200 },
    equipment: ['Defibrillator', 'Cardiac Monitor', 'IV Fluids', 'Oxygen', 'Ventilator'],
    pricing: { baseFare: 1000, perKm: 100, equipmentCharge: 300 },
    status: 'available',
  },
  {
    vehicleNumber: 'JAB-302',
    type: 'als',
    driver: { name: 'Tariq Mahmood', phone: '+92-300-4444444', rating: 4.8, totalRides: 455 },
    equipment: ['Defibrillator', 'Cardiac Monitor', 'IV Fluids', 'Oxygen'],
    pricing: { baseFare: 1000, perKm: 100, equipmentCharge: 300 },
    status: 'busy',
  },
  {
    vehicleNumber: 'JAB-155',
    type: 'icu',
    driver: { name: 'Dr. Farrukh Baig', phone: '+92-300-5555555', rating: 4.98, totalRides: 380 },
    equipment: ['Full Ventilator', 'ICU Monitor', 'Infusion Pump', 'Defibrillator', 'IV Fluids'],
    pricing: { baseFare: 2000, perKm: 150, equipmentCharge: 800 },
    status: 'available',
  },
  {
    vehicleNumber: 'JAB-776',
    type: 'neonatal',
    driver: { name: 'Dr. Sara Noor', phone: '+92-300-6666666', rating: 4.92, totalRides: 290 },
    equipment: ['Transport Incubator', 'Neonatal Ventilator', 'Pulse Oximeter'],
    pricing: { baseFare: 1500, perKm: 120, equipmentCharge: 500 },
    status: 'available',
  },
];

const MOCK_USER = {
  name: 'Muhammad Ali Khan',
  phone: '+92-300-7777777',
  bloodGroup: 'A+',
  allergies: ['Penicillin'],
  emergencyContacts: [{ name: 'Ayesha Khan', phone: '+92-321-0000000', relationship: 'Wife' }],
};

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/swiftaid');
  console.log('✅ Connected to MongoDB');

  // Clear existing data
  await Ambulance.deleteMany({});
  await User.deleteMany({});
  console.log('🗑️  Cleared existing data');

  // Create ambulances with random nearby coordinates
  const ambulances = await Ambulance.insertMany(
    MOCK_AMBULANCES.map(amb => ({
      ...amb,
      currentLocation: {
        type: 'Point',
        coordinates: [
          BASE_LON + randomOffset(0.04),
          BASE_LAT + randomOffset(0.04),
        ],
      },
    }))
  );
  console.log(`🚑 Created ${ambulances.length} ambulances`);

  // Create test user (OTP will be generated on login)
  const user = await User.create(MOCK_USER);
  console.log(`👤 Created test user: ${user.phone}`);

  console.log('\n🌱 Seed complete! Use these for testing:');
  console.log(`  Phone: ${MOCK_USER.phone}`);
  console.log(`  OTP: Will be printed to server console on login request`);
  console.log(`  Base coordinates: ${BASE_LAT}, ${BASE_LON} (Jhelum, Punjab)\n`);

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
