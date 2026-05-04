/**
 * UI Slice - Global UI state (toasts, modals, etc.)
 */
import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    toast:       null,  // { message, type: 'success'|'error'|'info' }
    isConnected: true,  // network connectivity
    isLoading:   false, // global overlay loader
  },
  reducers: {
    showToast: (state, action) => {
      state.toast = action.payload; // { message, type }
    },
    hideToast: (state) => {
      state.toast = null;
    },
    setConnected: (state, action) => {
      state.isConnected = action.payload;
    },
    setGlobalLoading: (state, action) => {
      state.isLoading = action.payload;
    },
  },
});

export const { showToast, hideToast, setConnected, setGlobalLoading } = uiSlice.actions;
export default uiSlice.reducer;
