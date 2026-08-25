import type { AuthError } from "@supabase/supabase-js";

export function getAuthErrorMessage(
  error: AuthError | Error | unknown,
): string {
  if (!error) {
    return "Something went wrong.";
  }

  const message = error instanceof Error ? error.message : String(error);

  if (message.includes("Invalid login credentials")) {
    return "Invalid email or password.";
  }

  if (message.includes("Email not confirmed")) {
    return "Please verify your email first.";
  }

  if (message.includes("User already registered")) {
    return "An account already exists with this email.";
  }

  if (message.includes("Password")) {
    return "Password does not meet requirements.";
  }

  if (message.toLowerCase().includes("rate limit")) {
    return "Too many attempts. Try again later.";
  }

  return "Authentication failed. Please try again.";
}
