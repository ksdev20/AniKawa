import { frontendUrl } from "@/global_assets/globalPaths";

const SITE_URL = frontendUrl;

export function getAccountDeletionVerificationUrl(token: string): string {
  return `${SITE_URL}api/profile/delete-account/verify?token=${encodeURIComponent(token)}`;
}
