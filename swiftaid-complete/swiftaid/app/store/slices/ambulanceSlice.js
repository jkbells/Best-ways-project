/**
 * Ambulance Slice — nearby ambulances and type info
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ambulanceAPI } from '../../services/api';

export const fetchNearbyAmbulances = createAsyncThunk(
  'ambulance/fetchNearby',
  async ({ latitude, longitude, type }, { rejectWithValue }) => {
    try {
      const data = await ambulanceAPI.getNearby(latitude, longitude, type);
      return data.ambulances;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchAmbulanceTypes = createAsyncThunk(
  'ambulance/fetchTypes',
  async (_, { rejectWithValue }) => {
    try {
      const data = await ambulanceAPI.getTypes();
      return data.types;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const ambulanceSlice = createSlice({
  name: 'ambulance',
  initialState: {
    nearby: [],
    types: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNearbyAmbulances.pending, (state) => { state.loading = true; })
      .addCase(fetchNearbyAmbulances.fulfilled, (state, action) => {
        state.loading = false;
        state.nearby = action.payload;
      })
      .addCase(fetchNearbyAmbulances.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder.addCase(fetchAmbulanceTypes.fulfilled, (state, action) => {
      state.types = action.payload;
    });
  },
});

export default ambulanceSlice.reducer;
