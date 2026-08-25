export interface AccountDeletionRequestRow {
  id: string;
  user_id: string;
  requested_at: string;
  delete_after: string;
  password_verified_at: string | null;
  email_verified_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  created_at: string;
}

export interface AccountDeletionVerificationRow {
  id: string;
  deletion_request_id: string;
  user_id: string;
  token_hash: string;
  expires_at: string;
  verified_at: string | null;
  created_at: string;
}

export interface AccountDeletionStatus {
  hasRequest: boolean;
  requestedAt: string | null;
  deleteAfter: string | null;
  passwordVerified: boolean;
  emailVerified: boolean;
  waitingPeriodComplete: boolean;
  canCancel: boolean;
  canComplete: boolean;
  remainingMs: number;
}