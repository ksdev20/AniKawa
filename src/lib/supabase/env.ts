function required(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

export const SUPABASE_URL = required(
  import.meta.env.PUBLIC_SUPABASE_URL,
  "PUBLIC_SUPABASE_URL",
);

export const SUPABASE_ANON_KEY = required(
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
  "PUBLIC_SUPABASE_ANON_KEY",
);

export const SUPABASE_SERVICE_ROLE_KEY = import.meta.env
  .SUPABASE_SERVICE_ROLE_KEY;