# 🚑 SwiftAid — On-Demand Ambulance Booking App

A production-ready MVP ambulance booking platform built with React Native (Expo) + Node.js + MongoDB + Socket.io.

---

## 📁 Project Structure

```
swiftaid/
├── server/                    ← Node.js + Express backend
│   ├── config/
│   │   └── database.js        ← MongoDB connection
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── ambulanceController.js
│   │   ├── bookingController.js
│   │   └── userController.js
│   ├── middlewares/
│   │   ├── auth.js            ← JWT verification
│   │   └── validate.js        ← express-validator
│   ├── models/
│   │   ├── User.js
│   │   ├── Ambulance.js
│   │   └── Booking.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── ambulanceRoutes.js
│   │   ├── bookingRoutes.js
│   │   └── userRoutes.js
│   ├── services/
│   │   ├── authService.js     ← OTP logic, JWT signing
│   │   ├── bookingService.js  ← Fare calc, driver matching
│   │   └── socketService.js   ← Socket.io event handlers
│   ├── seeds/
│   │   └── seed.js            ← Sample data seeder
│   ├── .env.example
│   ├── package.json
│   └── server.js              ← Entry point
│
└── app/                       ← React Native (Expo) frontend
    ├── components/
    │   ├── common/
    │   │   ├── Button.js
    │   │   ├── LoadingOverlay.js
    │   │   ├── ErrorState.js
    │   │   └── EmptyState.js
    │   └── booking/
    │       ├── AmbulanceTypeCard.js
    │       └── BookingStatusCard.js
    ├── screens/
    │   ├── SplashScreen.js
    │   ├── LoginScreen.js
    │   ├── OTPVerificationScreen.js
    │   ├── ProfileSetupScreen.js
    │   ├── HomeScreen.js
    │   ├── LocationPickerScreen.js
    │   ├── AmbulanceSelectionScreen.js
    │   ├── PatientDetailsScreen.js
    │   ├── ConfirmBookingScreen.js
    │   ├── TrackingScreen.js
    │   ├── CompletionScreen.js
    │   ├── RatingScreen.js
    │   ├── HistoryScreen.js
    │   └── ProfileScreen.js
    ├── navigation/
    │   └── AppNavigator.js    ← Stack + Tab navigation
    ├── store/
    │   ├── index.js
    │   └── slices/
    │       ├── authSlice.js
    │       ├── bookingSlice.js
    │       └── ambulanceSlice.js
    ├── services/
    │   ├── api.js             ← Axios HTTP client
    │   └── socketService.js   ← Socket.io client
    ├── utils/index.js
    ├── constants/index.js
    ├── hooks/useLocation.js
    ├── App.js
    └── app.json
```

---

## ⚡ Quick Start

### Prerequisites
- Node.js 18+
- MongoDB running locally (or MongoDB Atlas URI)
- Expo CLI: `npm install -g expo-cli`

---

### 1. Backend Setup

```bash
cd swiftaid/server
npm install

# Configure environment
cp .env.example .env
# Edit .env:
#   MONGODB_URI=mongodb://localhost:27017/swiftaid
#   JWT_SECRET=your-secret-key-here
#   PORT=5000

# Seed the database with sample ambulances + test user
npm run seed

# Start the server
npm run dev
```

Server runs on: `http://localhost:5000`

**Test the API:**
```bash
curl http://localhost:5000/api/health
# → {"status":"OK","timestamp":"..."}
```

---

### 2. Mobile App Setup

```bash
cd swiftaid/app
npm install

# Set your API URL in constants/index.js
# If running on physical device: replace localhost with your machine's IP
# e.g. export const API_BASE_URL = 'http://192.168.1.100:5000/api';

# Add your Google Maps API key in constants/index.js
# export const GOOGLE_MAPS_API_KEY = 'AIza...';

npx expo start
```

- Press **`a`** for Android emulator
- Press **`i`** for iOS simulator
- Scan QR code with Expo Go app on physical device

---

## 🔑 API Reference

### Auth
| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/send-otp` | `{ phone }` | Send OTP (logged to console in dev) |
| POST | `/api/auth/verify-otp` | `{ phone, otp }` | Verify OTP → returns JWT |
| PUT | `/api/auth/setup-profile` | `{ name, bloodGroup, emergencyContacts }` | First-time profile setup |
| GET | `/api/auth/me` | — | Get current user |

### Ambulances
| Method | Endpoint | Query | Description |
|--------|----------|-------|-------------|
| GET | `/api/ambulances/nearby` | `latitude, longitude, type?, radius?` | Nearby available ambulances |
| GET | `/api/ambulances/types` | — | All ambulance types + pricing |
| GET | `/api/ambulances/estimate` | `type, distanceKm` | Fare estimate |

### Bookings
| Method | Endpoint | Body/Params | Description |
|--------|----------|-------------|-------------|
| POST | `/api/bookings/create` | Full booking data | Create booking + match driver |
| POST | `/api/bookings/emergency` | `{ latitude, longitude }` | One-tap SOS booking |
| GET | `/api/bookings/history` | `?page=1&limit=10` | Past bookings |
| GET | `/api/bookings/:id` | — | Single booking detail |
| POST | `/api/bookings/update-status` | `{ bookingId, status }` | Update trip status |
| POST | `/api/bookings/:id/rate` | `{ score, tags, comment }` | Rate driver |

---

## 🧪 Testing the App

### Login Flow (OTP Mock)
1. Enter any phone number (e.g. `+923001234567`)
2. Backend prints OTP to server console: `📱 [MOCK SMS] OTP for +923001234567: 847291`
3. In **dev mode**, OTP also appears in an alert on the device
4. Enter the 6-digit code to log in

### Seeded Test Data
After running `npm run seed`, you get:
- **6 ambulances** near Jhelum, Punjab with real coordinates
- **1 test user** at `+92-300-7777777`
- Ambulance types: Basic, ALS, ICU, Neonatal

### Full Booking Flow
1. Home screen → tap ambulance type chip
2. Location picker → select a hospital
3. Ambulance selection → choose type
4. Patient details → enter info
5. Confirm → view fare breakdown
6. Matching → driver auto-assigned from seeded data
7. Tracking → live map (simulated movement in dev)
8. Complete trip → receipt
9. Rate driver

---

## 🔌 Real-Time (Socket.io)

Two namespaces:
- `/user` — passenger app connects here, joins booking room
- `/driver` — driver app connects here, sends location updates

**Events User Receives:**
- `driver_location` → `{ latitude, longitude, timestamp }`
- `booking_status_update` → `{ bookingId, status, timestamp }`

**Events Driver Sends:**
- `driver_register` → `{ ambulanceId }`
- `location_update` → `{ ambulanceId, latitude, longitude, bookingId }`
- `status_update` → `{ bookingId, status }`

---

## 🌍 Production Checklist

- [ ] Replace mock OTP with **Twilio Verify** or **Firebase Phone Auth**
- [ ] Replace `GOOGLE_MAPS_API_KEY` placeholder with real key
- [ ] Set `NODE_ENV=production` and strong `JWT_SECRET`
- [ ] Use **MongoDB Atlas** instead of local MongoDB
- [ ] Add HTTPS (reverse proxy with Nginx + Let's Encrypt)
- [ ] Implement real driver app (separate React Native app using `/driver` socket namespace)
- [ ] Add push notifications via **Firebase Cloud Messaging**
- [ ] Integrate **Easypaisa/JazzCash** payment APIs
- [ ] Add rate limiting (`express-rate-limit`)
- [ ] Set up monitoring (Sentry, Datadog)

---

## 🎨 Design System

| Color | Hex | Usage |
|-------|-----|-------|
| Emergency Red | `#E53935` | Primary CTAs, emergency actions |
| Trust Blue | `#0D47A1` | Header, secondary actions |
| Success Green | `#2E7D32` | Completed states |
| Warning Orange | `#E65100` | Moderate conditions, surge pricing |

---

## 📱 Screens Overview

| Screen | Description |
|--------|-------------|
| Splash | Onboarding slides with app intro |
| Login | Phone number entry |
| OTP Verification | 6-digit code with countdown timer |
| Profile Setup | Name, blood group, emergency contact |
| Home | Map + nearby ambulances + SOS button |
| Location Picker | Pickup/destination with hospital search |
| Ambulance Selection | 4 types with pricing & ETA |
| Patient Details | Name, condition, notes |
| Confirm Booking | Fare breakdown + payment method |
| Tracking | Live map + driver info + status steps |
| Completion | Receipt + payment summary |
| Rating | Star rating + feedback tags |
| History | Past bookings with rebook |
| Profile | User settings + medical profile |

