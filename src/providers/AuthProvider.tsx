import { useEffect, useRef, type PropsWithChildren } from "react";

import type { Session } from "@supabase/supabase-js";

import { supabase } from "@/lib/supabase";

import { getCurrentProfile } from "@/lib/profile/getCurrentProfile";

import { useAuthStore } from "@/stores/authStore";

import { useProfileStore } from "@/stores/profileStore";

function loginOneSignal(userId: string) {
  return new Promise<void>((resolve, reject) => {
    window.OneSignalDeferred ??= [];

    window.OneSignalDeferred.push(async (OneSignal) => {
      try {
        await OneSignal.login(userId);
        resolve();
      } catch (error: unknown) {
        reject(error);
      }
    });
  });
}

function logoutOneSignal() {
  return new Promise<void>((resolve, reject) => {
    window.OneSignalDeferred ??= [];

    window.OneSignalDeferred.push(async (OneSignal) => {
      try {
        await OneSignal.logout();
        resolve();
      } catch (error: unknown) {
        reject(error);
      }
    });
  });
}

export default function AuthProvider({ children }: PropsWithChildren) {
  const { setUser, setSession, setProfile, setInitialized, clear } =
    useAuthStore();

  const resetProfileStore = useProfileStore((state) => state.reset);

  const handledSignInSession = useRef<string | null>(null);

  async function loadUser(session: Session | null) {
    setSession(session);

    const user = session?.user ?? null;

    setUser(user);

    if (!user) {
      setProfile(null);

      return;
    }

    // Link this browser's OneSignal subscription
    // to the authenticated Anikawa user.
    void loginOneSignal(user.id).catch((error) => {
      console.error("OneSignal login failed", error);
    });

    const profile = await getCurrentProfile(user.id);

    setProfile(profile);
  }

  useEffect(() => {
    let mounted = true;

    async function initialize() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;

      await loadUser(session);

      setInitialized(true);
    }

    initialize();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      switch (event) {
        case "SIGNED_IN": {
          if (!session) return;

          if (handledSignInSession.current === session.access_token) {
            return;
          }

          handledSignInSession.current = session.access_token;

          resetProfileStore();

          await loadUser(session);

          break;
        }

        case "TOKEN_REFRESHED": {
          setSession(session);

          setUser(session?.user ?? null);

          break;
        }

        case "USER_UPDATED": {
          await loadUser(session);

          break;
        }

        case "SIGNED_OUT": {
          void logoutOneSignal().catch((error) => {
            console.error("OneSignal logout failed", error);
          });

          clear();

          resetProfileStore();

          break;
        }

        default: {
          setSession(session);

          setUser(session?.user ?? null);
        }
      }
    });

    return () => {
      mounted = false;

      subscription.unsubscribe();
    };
  }, [
    clear,
    resetProfileStore,
    setInitialized,
    setProfile,
    setSession,
    setUser,
  ]);

  return children;
}
