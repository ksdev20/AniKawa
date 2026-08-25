import type { AccountDeletionStatus } from "./types";

const ACCOUNT_DELETION_ENDPOINT = "/api/profile/delete-account";

interface ApiErrorResponse {
  error?: string;
  message?: string;
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (response.ok) {
    if (response.status === 204) {
      return undefined as T;
    }

    const contentType = response.headers.get("content-type") ?? "";

    if (!contentType.includes("application/json")) {
      return undefined as T;
    }

    return (await response.json()) as T;
  }

  let message = "Something went wrong. Please try again.";

  try {
    const data = (await response.json()) as ApiErrorResponse;

    if (data.error) {
      message = data.error;
    } else if (data.message) {
      message = data.message;
    }
  } catch {
    // Keep the generic error when the response is not JSON.
  }

  throw new Error(message);
}

/**
 * Get the currently authenticated user's account
 * deletion status.
 */
export async function getAccountDeletionStatus(): Promise<AccountDeletionStatus> {
  const response = await fetch(ACCOUNT_DELETION_ENDPOINT, {
    method: "GET",
    credentials: "same-origin",
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  return parseResponse<AccountDeletionStatus>(response);
}

/**
 * Start an account deletion request.
 *
 * The backend verifies the password, creates the
 * 24-hour deletion request and sends the email
 * verification message.
 */
export async function requestAccountDeletion(password: string): Promise<void> {
  const response = await fetch(`${ACCOUNT_DELETION_ENDPOINT}/request`, {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      password,
    }),
  });

  await parseResponse<unknown>(response);
}

/**
 * Cancel the currently active account deletion request.
 */
export async function cancelAccountDeletion(): Promise<void> {
  const response = await fetch(`${ACCOUNT_DELETION_ENDPOINT}/cancel`, {
    method: "POST",
    credentials: "same-origin",
    headers: {
      Accept: "application/json",
    },
  });

  await parseResponse<unknown>(response);
}

/**
 * Permanently delete the authenticated account.
 *
 * The backend is responsible for checking:
 * - authenticated user
 * - active deletion request
 * - password verification
 * - email verification
 * - 24-hour waiting period
 * - final account deletion
 */
export async function completeAccountDeletion(): Promise<void> {
  const response = await fetch(`${ACCOUNT_DELETION_ENDPOINT}/complete`, {
    method: "POST",
    credentials: "same-origin",
    headers: {
      Accept: "application/json",
    },
  });

  await parseResponse<unknown>(response);
}
