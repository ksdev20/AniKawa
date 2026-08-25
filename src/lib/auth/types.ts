import type { Session, User } from "@supabase/supabase-js";

export type AuthResult<T = null> = {
  data: T | null;
  error: string | null;
};

export type AuthData = {
  user: User | null;
  session: Session | null;
};

export type LoginInput = {
  email: string;
  password: string;
  captchaToken: string | null;
};

export type SignupInput = {
  displayName: string;
  email: string;
  password: string;
  captchaToken: string | null;
};

export type OAuthProvider = "google" | "discord";

export type ResetPasswordInput = {
  email: string;
};

export type UpdatePasswordInput = {
  password: string;
};

export type ResendVerificationInput = {
  email: string;
};

export type VerifyTurnstileInput = {
  token: string;
};

export type VerifyTurnstileResponse = {
  success: boolean;
};
