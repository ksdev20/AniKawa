const RESEND_API_KEY = import.meta.env.RESEND_API_KEY;

if (!RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY is not configured.");
}

export { RESEND_API_KEY };