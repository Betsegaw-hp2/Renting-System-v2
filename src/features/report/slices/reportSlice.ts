import { getErrorMessage } from '@/features/auth/slices/authSlice';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { reportApi } from '../api/reportApi';
import type { CreateReportPayload, Report } from '../types/report.types';

interface ReportState {
  myReport?: Report;
  loading: boolean;
  error?: string;
}

const initialState: ReportState = { loading: false };

export const createReport = createAsyncThunk<Report, CreateReportPayload>(
  'report/create',
  async (payload, { rejectWithValue }) => {
    try {
      return await reportApi.create(payload);
    } catch (e: any) {
      return rejectWithValue(getErrorMessage(e));
    }
  }
);

export const fetchReport = createAsyncThunk<Report, string>(
  'report/fetchOne',
  async (id, { rejectWithValue }) => {
    try {
      return await reportApi.fetchOne(id);
    } catch (e: any) {
      return rejectWithValue(getErrorMessage(e));
    }
  }
);

const reportSlice = createSlice({
  name: 'report',
  initialState,
  reducers: {},
  extraReducers: (b) =>
    b
      .addCase(createReport.pending, (s) => { s.loading = true; s.error = undefined; })
      .addCase(createReport.fulfilled, (s, a) => { s.loading = false; s.myReport = a.payload; })
      .addCase(createReport.rejected, (s, a) => { s.loading = false; s.error = a.payload as string; })

      .addCase(fetchReport.pending, (s) => { s.loading = true; s.error = undefined; })
      .addCase(fetchReport.fulfilled, (s, a) => { s.loading = false; s.myReport = a.payload; })
      .addCase(fetchReport.rejected, (s, a) => { s.loading = false; s.error = a.payload as string; }),
});

export default reportSlice.reducer;
