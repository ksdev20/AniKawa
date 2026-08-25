import { logout } from "@/lib/auth/logout";

export async function handleLogout() {
  const result = await logout();

  if (result.error) {
    console.error(result.error);
  }
  if (window.location.pathname.includes("/profile")) {
    window.location.href = "/";
  } else {
    window.location.reload();
  }
}
