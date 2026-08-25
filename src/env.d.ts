/// <reference types="astro/client" />

import type { SupabaseClient, Session, User } from "@supabase/supabase-js";
import type { Database } from "./lib/supabase/types";

declare global {
  namespace App {
    interface Locals {
      supabase: SupabaseClient<Database>;
      session: Session | null;
      user: User | null;
    }
  }
}

export {};