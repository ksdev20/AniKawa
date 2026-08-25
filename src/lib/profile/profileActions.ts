interface ApiSuccess<T> {
  success: true;
  data: T;
}

interface ApiError {
  success: false;
  error?: string;
}

type ApiResponse<T> = ApiSuccess<T> | ApiError;

async function parseResponse<T>(response: Response): Promise<ApiResponse<T>> {
  let result: unknown;

  try {
    result = await response.json();
  } catch {
    throw new Error("The server returned an invalid response.");
  }

  if (typeof result !== "object" || result === null || !("success" in result)) {
    throw new Error("The server returned an invalid response.");
  }

  return result as ApiResponse<T>;
}

export async function toggleProfileFollow(username: string) {
  const response = await fetch("/api/profile/follow", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username }),
  });

  const result = await parseResponse<{
    isFollowing: boolean;
  }>(response);

  if (!response.ok || !result.success) {
    throw new Error(
      result.success
        ? "Failed to update follow status."
        : result.error || "Failed to update follow status.",
    );
  }

  if (typeof result.data?.isFollowing !== "boolean") {
    throw new Error("Invalid follow response from server.");
  }

  return result.data.isFollowing;
}

export async function toggleProfileBlock(username: string) {
  const response = await fetch("/api/profile/block", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username }),
  });

  const result = await parseResponse<{
    isBlocked: boolean;
  }>(response);

  if (!response.ok || !result.success) {
    throw new Error(
      result.success
        ? "Failed to update block status."
        : result.error || "Failed to update block status.",
    );
  }

  if (typeof result.data?.isBlocked !== "boolean") {
    throw new Error("Invalid block response from server.");
  }

  return result.data.isBlocked;
}

export async function reportProfile(
  username: string,
  reason: string,
  description: string | null,
) {
  const response = await fetch("/api/profile/report", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      reason,
      description,
    }),
  });

  const result = await parseResponse<{
    reported: boolean;
    reportId: string;
  }>(response);

  if (!response.ok || !result.success) {
    throw new Error(
      result.success
        ? "Failed to submit report."
        : result.error || "Failed to submit report.",
    );
  }

  if (
    result.data?.reported !== true ||
    typeof result.data?.reportId !== "string"
  ) {
    throw new Error("Invalid report response from server.");
  }

  return result.data;
}
