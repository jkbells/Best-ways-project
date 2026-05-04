/**
 * Booking Slice — manages booking lifecycle state
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { bookingAPI } from '../../services/api';

export const createBooking = createAsyncThunk('booking/create', async (data, { rejectWithValue }) => {
  try {
    const res = await bookingAPI.create(data);
    return res.booking;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const createEmergencyBooking = createAsyncThunk('booking/emergency', async ({ latitude, longitude }, { rejectWithValue }) => {
  try {
    const res = await bookingAPI.emergency(latitude, longitude);
    return res.booking;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const fetchBooking = createAsyncThunk('booking/fetchOne', async (id, { rejectWithValue }) => {
  try {
    const res = await bookingAPI.getOne(id);
    return res.booking;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const fetchHistory = createAsyncThunk('booking/fetchHistory', async ({ page = 1 } = {}, { rejectWithValue }) => {
  try {
    const res = await bookingAPI.getHistory(page);
    return res;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const updateStatus = createAsyncThunk('booking/updateStatus', async ({ bookingId, status }, { rejectWithValue }) => {
  try {
    const res = await bookingAPI.updateStatus(bookingId, status);
    return res.booking;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const submitRating = createAsyncThunk('booking/rate', async ({ bookingId, ...data }, { rejectWithValue }) => {
  try {
    const res = await bookingAPI.rate(bookingId, data);
    return res.booking;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

const bookingSlice = createSlice({
  name: 'booking',
  initialState: {
    current: null,           // Active booking object
    history: [],
    pagination: {},
    driverLocation: null,    // Real-time driver coords from socket
    loading: false,
    error: null,
    // Form state (passed between booking flow screens)
    form: {
      pickup: null,
      destination: null,
      ambulanceType: 'basic',
      patient: { name: '', condition: 'moderate', notes: '', passengerCount: 1 },
      paymentMethod: 'cash',
    },
  },
  reducers: {
    setFormPickup: (state, action) => { state.form.pickup = action.payload; },
    setFormDestination: (state, action) => { state.form.destination = action.payload; },
    setFormAmbulanceType: (state, action) => { state.form.ambulanceType = action.payload; },
    setFormPatient: (state, action) => { state.form.patient = { ...state.form.patient, ...action.payload }; },
    setFormPayment: (state, action) => { state.form.paymentMethod = action.payload; },
    clearForm: (state) => {
      state.form = {
        pickup: null, destination: null, ambulanceType: 'basic',
        patient: { name: '', condition: 'moderate', notes: '', passengerCount: 1 },
        paymentMethod: 'cash',
      };
    },
    updateDriverLocation: (state, action) => {
      state.driverLocation = action.payload;
    },
    updateCurrentBookingStatus: (state, action) => {
      if (state.current) state.current.status = action.payload.status;
    },
    clearCurrentBooking: (state) => {
      state.current = null;
      state.driverLocation = null;
    },
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    const pending = (state) => { state.loading = true; state.error = null; };
    const rejected = (state, action) => { state.loading = false; state.error = action.payload; };

    builder
      .addCase(createBooking.pending, pending)
      .addCase(createBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload;
      })
      .addCase(createBooking.rejected, rejected);

    builder
      .addCase(createEmergencyBooking.pending, pending)
      .addCase(createEmergencyBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload;
      })
      .addCase(createEmergencyBooking.rejected, rejected);

    builder
      .addCase(fetchBooking.fulfilled, (state, action) => {
        state.current = action.payload;
      });

    builder
      .addCase(fetchHistory.pending, pending)
      .addCase(fetchHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.history = action.payload.page === 1
          ? action.payload.bookings
          : [...state.history, ...action.payload.bookings];
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchHistory.rejected, rejected);

    builder
      .addCase(updateStatus.fulfilled, (state, action) => {
        state.current = action.payload;
      });
  },
});

export const {
  setFormPickup, setFormDestination, setFormAmbulanceType,
  setFormPatient, setFormPayment, clearForm,
  updateDriverLocation, updateCurrentBookingStatus,
  clearCurrentBooking, clearError,
} = bookingSlice.actions;

export default bookingSlice.reducer;
