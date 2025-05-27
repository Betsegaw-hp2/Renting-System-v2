import type { AppDispatch, RootState } from '@/store';
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createReport, fetchReport } from '../slices/reportSlice';
import type { CreateReportPayload } from '../types/report.types';

export function useReport() {
  const dispatch = useDispatch<AppDispatch>();
  const { myReport, loading, error } = useSelector((s: RootState) => s.report);

  const submit = useCallback((payload: CreateReportPayload) => {
    dispatch(createReport(payload));
  }, [dispatch]);

  const loadOne = useCallback((id: string) => {
    dispatch(fetchReport(id));
  }, [dispatch]);

  return { myReport, loading, error, submit, loadOne };
}
