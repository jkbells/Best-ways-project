/**
 * Database Seed Script
 * Populates MongoDB with mock ambulances and test user
 * Run: npm run seed
 */
require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const Ambulance = require('../models/Ambulance');
const User = require('../models/User');

// Jhelum, Punjab area coordinates (approx)
const JHELUM_CENTER = { lat: 32.9425, lng: 73.7257 };

const randomOffset = (range = 0.05) =>
  (Math.random() - 0.5) * range * 2;

const ambulances = [
  // Basic Ambulances
  {
    driverName:    'Ahmad Hassan',
    driverPhone:   '+92-300-1000001',
    driverRating:  4.9,
    vehicleNumber: 'JAB-447',
    type:          'basic',
    features:      ['Oxygen', 'Stretcher', 'EMT', 'First Aid Kit'],
    baseFare:       500,
    perKmRate:      80,
    equipmentCharge:90,
    location: {
      type:        'Point',
      coordinates: [JHELUM_CENTER.lng + randomOffset(0.04), JHELUM_CENTER.lat + randomOffset(0.04)],
    },
    status:   'available',
    isActive: true,
  },
  {
    driverName:    'Rizwan Shah',
    driverPhone:   '+92-300-1000002',
    driverRating:  4.7,
    vehicleNumber: 'JAB-219',
    type:          'basic',
    features:      ['Oxygen', 'Stretcher', 'EMT', 'First Aid Kit'],
    baseFare:       500,
    perKmRate:      80,
    equipmentCharge:90,
    location: {
      type:        'Point',
      coordinates: [JHELUM_CENTER.lng + randomOffset(0.05), JHELUM_CENTER.lat + randomOffset(0.05)],
    },
    status:   'available',
    isActive: true,
  },
  {
    driverName:    'Tariq Mehmood',
    driverPhone:   '+92-300-1000003',
    driverRating:  4.8,
    vehicleNumber: 'JAB-533',
    type:          'basic',
    features:      ['Oxygen', 'Stretcher', 'EMT'],
    baseFare:       500,
    perKmRate:      80,
    equipmentCharge:90,
    location: {
      type:        'Point',
      coordinates: [JHELUM_CENTER.lng + randomOffset(0.06), JHELUM_CENTER.lat + randomOffset(0.06)],
    },
    status:   'available',
    isActive: true,
  },
  // ALS
  {
    driverName:    'Dr. Farrukh Nawaz',
    driverPhone:   '+92-300-1000004',
    driverRating:  4.9,
    vehicleNumber: 'JAB-ALS-01',
    type:          'als',
    features:      ['Defibrillator', 'Cardiac Monitor', 'IV Fluids', 'Paramedic', 'Oxygen'],
    baseFare:       1200,
    perKmRate:      120,
    equipmentCharge:200,
    location: {
      type:        'Point',
      coordinates: [JHELUM_CENTER.lng + randomOffset(0.07), JHELUM_CENTER.lat + randomOffset(0.07)],
    },
    status:   'available',
    isActive: true,
  },
  {
    driverName:    'Imran Khan',
    driverPhone:   '+92-300-1000005',
    driverRating:  4.6,
    vehicleNumber: 'JAB-ALS-02',
    type:          'als',
    features:      ['Defibrillator', 'Cardiac Monitor', 'IV Fluids', 'Paramedic'],
    baseFare:       1200,
    perKmRate:      120,
    equipmentCharge:200,
    location: {
      type:        'Point',
      coordinates: [JHELUM_CENTER.lng + randomOffset(0.08), JHELUM_CENTER.lat + randomOffset(0.08)],
    },
    status:   'available',
    isActive: true,
  },
  // ICU
  {
    driverName:    'Dr. Shahid Iqbal',
    driverPhone:   '+92-300-1000006',
    driverRating:  5.0,
    vehicleNumber: 'JAB-ICU-01',
    type:          'icu',
    features:      ['Ventilator', 'ICU Setup', 'Doctor on Board', 'Cardiac Monitor', 'IV Fluids'],
    baseFare:       2500,
    perKmRate:      180,
    equipmentCharge:400,
    location: {
      type:        'Point',
      coordinates: [JHELUM_CENTER.lng + randomOffset(0.06), JHELUM_CENTER.lat + randomOffset(0.06)],
    },
    status:   'available',
    isActive: true,
  },
  // Neonatal
  {
    driverName:    'Dr. Ayesha Siddiqui',
    driverPhone:   '+92-300-1000007',
    driverRating:  4.9,
    vehicleNumber: 'JAB-NEO-01',
    type:          'neonatal',
    features:      ['Incubator', 'Neonatologist', 'IV Fluids', 'Oxygen', 'Phototherapy'],
    baseFare:       1800,
    perKmRate:      150,
    equipmentCharge:300,
    location: {
      type:        'Point',
      coordinates: [JHELUM_CENTER.lng + randomOffset(0.05), JHELUM_CENTER.lat + randomOffset(0.05)],
    },
    status:   'available',
    isActive: true,
  },
];

const testUser = {
  name:  'Muhammad Khan',
  phone: '+92-300-1234567',
  email: 'test@swiftaid.pk',
  medicalProfile: {
    bloodGroup: 'A+',
    allergies:  ['Penicillin'],
    conditions: [],
    notes:      'Test user',
  },
  emergencyContacts: [
    { name: 'Ayesha Khan', phone: '+92-321-0000000', relationship: 'Wife' },
  ],
};

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/swiftaid');
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Ambulance.deleteMany({});
    await User.deleteMany({ phone: testUser.phone });
    console.log('🧹 Cleared existing data');

    // Insert ambulances
    const createdAmbs = await Ambulance.insertMany(ambulances);
    console.log(`🚑 Created ${createdAmbs.length} ambulances`);

    // Create test user
    const user = await User.create(testUser);
    console.log(`👤 Test user created: ${user.phone}`);

    console.log('\n✅ Seeding complete!');
    console.log('─────────────────────────────');
    console.log('Test Login: +92-300-1234567');
    console.log('OTP (dev):  1234');
    console.log('─────────────────────────────\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    process.exit(1);
  }
};

seed();
