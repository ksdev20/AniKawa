import { useState } from "react";
import {
  ChatCircleIcon,
  DotsThreeIcon,
  FlagIcon,
  LockIcon,
  ShareNetworkIcon,
} from "@phosphor-icons/react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { toast } from "sonner";

import { useAuth } from "@/hooks/useAuth";
import { useLoginModalStore } from "@/global_assets/loginModalStore";
import {
  toggleProfileBlock,
  toggleProfileFollow,
} from "@/lib/profile/profileActions";
import ReportProfileModal from "./ReportProfileModal";

interface ProfileHeroActionsProps {
  username: string;
  isFollowing: boolean;
  isBlocked: boolean;
}

export default function ProfileHeroActions({
  username,
  isFollowing: initialIsFollowing,
  isBlocked: initialIsBlocked,
}: ProfileHeroActionsProps) {
  const { user } = useAuth();
  const isLoggedIn = !!user;

  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);

  const [isBlocked, setIsBlocked] = useState(initialIsBlocked);

  const [isFollowLoading, setIsFollowLoading] = useState(false);

  const [isBlockLoading, setIsBlockLoading] = useState(false);
  
  const [isFollowHovered, setIsFollowHovered] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

  const requireLogin = () => {
    useLoginModalStore.getState().openLogin();
  };

  const handleFollow = async () => {
    if (!isLoggedIn) {
      requireLogin();
      return;
    }

    if (isFollowLoading) return;

    setIsFollowLoading(true);

    try {
      const nextIsFollowing = await toggleProfileFollow(username);

      setIsFollowing(nextIsFollowing);

      toast.success(
        nextIsFollowing
          ? `You are now following @${username}.`
          : `You unfollowed @${username}.`,
      );
    } catch (error) {
      console.error("[ProfileHeroActions] Follow failed:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update follow status.",
      );
    } finally {
      setIsFollowLoading(false);
    }
  };

  const handleBlock = async () => {
    if (!isLoggedIn) {
      requireLogin();
      return;
    }

    if (isBlockLoading) return;

    setIsBlockLoading(true);

    try {
      const nextIsBlocked = await toggleProfileBlock(username);

      setIsBlocked(nextIsBlocked);

      toast.success(
        nextIsBlocked
          ? `@${username} has been blocked.`
          : `@${username} has been unblocked.`,
      );
    } catch (error) {
      console.error("[ProfileHeroActions] Block failed:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update block status.",
      );
    } finally {
      setIsBlockLoading(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;

    const shareTitle = `@${username} on Anikawa`;
    const shareText = `Check out @${username}'s profile on Anikawa.`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url,
        });

        toast.success("Profile shared.");
        return;
      }

      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);

        toast.success("Profile link copied to clipboard.");
        return;
      }

      toast.error("Sharing isn't supported on this device.");
    } catch (error) {
      // User intentionally cancelled the native share sheet.
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      console.error("[ProfileHeroActions] Share failed:", error);

      toast.error("Unable to share this profile. Please try again.");
    }
  };

  const handleMessage = () => {
    if (!isLoggedIn) {
      requireLogin();
      return;
    }

    toast.info("Messaging is coming soon.");
  };

  return (
    <>
      <div className="profile-hero-actions">
        <DropdownMenu.Root modal={false}>
          <DropdownMenu.Trigger asChild>
            <button
              type="button"
              className="profile-hero-actions__icon-button"
              aria-label="More profile options"
              title="More options"
            >
              <DotsThreeIcon size={22} weight="bold" />
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="profile-hero-actions__menu"
              sideOffset={8}
              align="end"
            >
              <DropdownMenu.Item
                className="profile-hero-actions__menu-item"
                onSelect={(event) => {
                  event.preventDefault();

                  if (!isLoggedIn) {
                    requireLogin();
                    return;
                  }

                  setIsReportOpen(true);
                }}
              >
                <FlagIcon size={18} />
                <span>Report</span>
              </DropdownMenu.Item>

              <DropdownMenu.Item
                disabled={isBlockLoading}
                className="profile-hero-actions__menu-item"
                onSelect={(event) => {
                  event.preventDefault();

                  if (!isBlockLoading) {
                    void handleBlock();
                  }
                }}
              >
                <LockIcon size={18} />
                <span>
                  {isBlockLoading
                    ? isBlocked
                      ? "Unblocking..."
                      : "Blocking..."
                    : isBlocked
                      ? "Unblock"
                      : "Block"}
                </span>
              </DropdownMenu.Item>

              <DropdownMenu.Item
                className="profile-hero-actions__menu-item"
                onSelect={(event) => {
                  event.preventDefault();
                  void handleShare();
                }}
              >
                <ShareNetworkIcon size={18} />
                <span>Share</span>
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>

        <button
          type="button"
          onClick={handleMessage}
          className="profile-hero-actions__icon-button"
          aria-label="Message"
          title="Message"
        >
          <ChatCircleIcon size={20} weight="bold" />
        </button>

        <button
          type="button"
          onClick={handleFollow}
          disabled={isFollowLoading}
          onMouseEnter={() => setIsFollowHovered(true)}
          onMouseLeave={() => setIsFollowHovered(false)}
          className={`profile-hero-actions__follow ${
            isFollowing ? "profile-hero-actions__follow--following" : ""
          }`}
        >
          {isFollowLoading
            ? "..."
            : isFollowing
              ? isFollowHovered
                ? "Unfollow"
                : "Following"
              : "Follow"}
        </button>
      </div>
      <ReportProfileModal
        username={username}
        open={isReportOpen}
        onOpenChange={setIsReportOpen}
      />
    </>
  );
}
