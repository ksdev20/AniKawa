import { useAuthStore } from "@/stores/authStore";

export function useAuth() {
  const {
    user,
    session,
    profile,

    loading,
    initialized,

    login,
    signup,
    logout,
    setProfile,
  } = useAuthStore();

  return {
    user,
    session,
    profile,

    loading,
    initialized,

    login,
    signup,
    logout,

    isAuthenticated: !!user,
    setProfile,
  };
}
