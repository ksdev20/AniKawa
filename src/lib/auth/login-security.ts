export async function recordLoginSecurityEvent() {
  try {
    const response = await fetch(
      "/api/auth/login-security",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      console.error(
        "[Login Security] Failed to record login",
      );
      return;
    }

    const data = await response.json();

    if (data?.data?.unusual) {
      console.info(
        "[Login Security] Unusual login detected",
      );
    }
  } catch (error) {
    console.error(
      "[Login Security] Request failed",
      error,
    );
  }
}