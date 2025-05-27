export type ReportStatus = 'open' | 'under_review' | 'resolved' | 'dismissed';

export interface Report {
  id: string;
  listing_id?: string;     // optional: if report is about a specific listing
  reported_id: string;     // the user being reported
  reporter_id: string;     // the user who reports
  reason: string;
  description?: string;
  status: ReportStatus;
  created_at: string;
  updated_at: string;
}

export interface CreateReportPayload {
  reported_id: string;
  reason: string;
  description?: string;
  listing_id?: string;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
  createdAt: string;
}
