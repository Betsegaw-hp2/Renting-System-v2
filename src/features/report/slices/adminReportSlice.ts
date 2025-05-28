import { adminApi } from '@/features/admin/api/adminApi';
import { getErrorMessage } from '@/features/auth/slices/authSlice';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { Report } from '../types/report.types';

export interface AdminReportState {
  list: Report[];
  selected?: Report;
  loading: boolean;
  error?: string;
}

const initialState: AdminReportState = { list: [], loading: false };

export const fetchReports = createAsyncThunk<Report[], { limit: number; offset: number; since?: string; sortOrder?: 'asc' | 'desc' }>(
  'adminReports/fetchReports',
  async (params, { rejectWithValue }) => {
    try {
      return await adminApi.getReports(params);
    } catch (e: any) {
      return rejectWithValue(getErrorMessage(e));
    }
  }
);

export const fetchReportById = createAsyncThunk<Report, string>(
  'adminReports/fetchOne',
  async (id, { rejectWithValue }) => {
    try {
      console.log('Fetching report by ID:', id);
      return await adminApi.getReport(id);
    } catch (e: any) {
      return rejectWithValue(getErrorMessage(e));
    }
  }
);

export const markUnderReview = createAsyncThunk<Report, string>(
  'adminReports/underReview',
  async (id, { rejectWithValue }) => {
    try {
      return await adminApi.markReportUnderReview(id);
    } catch (e: any) {
      return rejectWithValue(getErrorMessage(e));
    }
  }
);

export const resolveReport = createAsyncThunk<Report, string>(
  'adminReports/resolve',
  async (id, { rejectWithValue }) => {
    try {
      return await adminApi.resolveReport(id);
    } catch (e: any) {
      return rejectWithValue(getErrorMessage(e));
    }
  }
);

export const dismissReport = createAsyncThunk<Report, string>(
  'adminReports/dismiss',
  async (id, { rejectWithValue }) => {
    try {
      return await adminApi.dismissReport(id);
    } catch (e: any) {
      return rejectWithValue(getErrorMessage(e));
    }
  }
);

export const deleteReport = createAsyncThunk<void, string>(
  'adminReports/delete',
  async (id, { rejectWithValue }) => {
    try {
      await adminApi.deleteReport(id);
    } catch (e: any) {
      return rejectWithValue(getErrorMessage(e));
    }
  }
);

const adminReportSlice = createSlice({
  name: 'adminReports',
  initialState,
  reducers: {},
  extraReducers: builder =>
    builder
      // fetch all
      .addCase(fetchReports.pending, s => { s.loading = true; s.error = undefined; })
      .addCase(fetchReports.fulfilled, (s, a) => { s.loading = false; s.list = a.payload; })
      .addCase(fetchReports.rejected, (s, a) => { s.loading = false; s.error = a.payload as string; })

      // fetch one
      .addCase(fetchReportById.pending, s => { s.loading = true; s.error = undefined; })
      .addCase(fetchReportById.fulfilled, (s, a) => { s.loading = false; s.selected = a.payload; })
      .addCase(fetchReportById.rejected, (s, a) => { s.loading = false; s.error = a.payload as string; })

      // under review
      .addCase(markUnderReview.fulfilled, (s, a) => {
        s.selected = a.payload;
        s.list = s.list.map(r => (r.id === a.payload.id ? a.payload : r));
      })
      // resolve
      .addCase(resolveReport.fulfilled, (s, a) => {
        s.selected = a.payload;
        s.list = s.list.map(r => (r.id === a.payload.id ? a.payload : r));
      })
      // dismiss
      .addCase(dismissReport.fulfilled, (s, a) => {
        s.selected = a.payload;
        s.list = s.list.map(r => (r.id === a.payload.id ? a.payload : r));
      })
      // delete
      .addCase(deleteReport.fulfilled, (s, a) => {
        s.list = s.list.filter(r => r.id !== a.meta.arg);
      }),
});

export default adminReportSlice.reducer;
