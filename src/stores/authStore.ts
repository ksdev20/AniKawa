import { create } from "zustand";
import type { Session, User } from "@supabase/supabase-js";

import type { Tables } from "@/lib/supabase";

import { login as loginAction } from "@/lib/auth/login";
import { signup as signupAction } from "@/lib/auth/signup";
import { logout as logoutAction } from "@/lib/auth/logout";
import { mergeGuestUserData } from "@/lib/auth/mergeGuestUserData";
import { useProfileStore } from "@/stores/profileStore";

type Profile = Tables<"profiles">;

type AuthStore = {
  user: User | null;

  session: Session | null;

  profile: Profile | null;

  loading: boolean;

  initialized: boolean;

  setUser: (user: User | null) => void;

  setSession: (session: Session | null) => void;

  setProfile: (profile: Profile | null) => void;

  setLoading: (loading: boolean) => void;

  setInitialized: (initialized: boolean) => void;

  login: typeof loginAction;

  signup: typeof signupAction;

  logout: typeof logoutAction;

  clear: () => void;
};

async function recordLoginSecurityEvent() {
  try {
    const response = await fetch("/api/auth/login-security", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error("[Login Security] Failed to record login");

      return;
    }

    const data = await response.json();

    if (data?.data?.unusual) {
      console.info("[Login Security] Unusual login detected");
    }
  } catch (error) {
    console.error("[Login Security] Request failed", error);
  }
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,

  session: null,

  profile: null,

  loading: false,

  initialized: false,

  setUser(user) {
    set({
      user,
    });
  },

  setSession(session) {
    set({
      session,
    });
  },

  setProfile(profile) {
    set({
      profile,
    });
  },

  setLoading(loading) {
    set({
      loading,
    });
  },

  setInitialized(initialized) {
    set({
      initialized,
    });
  },

  async login(input) {
    set({
      loading: true,
    });

    try {
      const result = await loginAction(input);

      if (result.data?.user) {
        const userId = result.data.user.id;

        void recordLoginSecurityEvent();

        void mergeGuestUserData(userId).catch((error) => {
          console.error("Guest merge failed", error);
        });

        void useProfileStore
          .getState()
          .fetchProfile()
          .catch((error) => {
            console.error("Failed to fetch profile after login", error);
          });
      }

      return result;
    } finally {
      set({
        loading: false,
      });
    }
  },

  async signup(input) {
    set({
      loading: true,
    });

    try {
      return await signupAction(input);
    } finally {
      set({
        loading: false,
      });
    }
  },

  async logout() {
    set({
      loading: true,
    });

    try {
      return await logoutAction();
    } finally {
      set({
        loading: false,
      });
    }
  },

  clear() {
    set({
      user: null,

      session: null,

      profile: null,

      initialized: false,
    });
  },
}));
