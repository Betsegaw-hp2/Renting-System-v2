import type { AppDispatch, RootState } from '@/store';
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  deleteReport,
  dismissReport,
  fetchReportById,
  fetchReports,
  markUnderReview,
  resolveReport,
  type AdminReportState,
} from '../slices/adminReportSlice';

export function useAdminReports() {
  const dispatch = useDispatch<AppDispatch>();
  const { list, selected, loading, error } = useSelector((s: RootState) => s.adminReports) as AdminReportState;

  const loadList = useCallback((params: { limit: number; offset: number; since?: string; sort?: string }) => dispatch(fetchReports(params)).unwrap(), [dispatch]);
  const loadOne = useCallback((id: string) => dispatch(fetchReportById(id)).unwrap(), [dispatch]);
  const toUnderReview = useCallback((id: string) => dispatch(markUnderReview(id)).unwrap(), [dispatch]);
  const toResolve = useCallback((id: string) => dispatch(resolveReport(id)).unwrap(), [dispatch]);
  const toDismiss = useCallback((id: string) => dispatch(dismissReport(id)).unwrap(), [dispatch]);
  const toDelete = useCallback((id: string) => dispatch(deleteReport(id)).unwrap(), [dispatch]);

  return {
    list,
    selected,
    loading,
    error,
    loadList,
    loadOne,
    toUnderReview,
    toResolve,
    toDismiss,
    toDelete,
  };
}
