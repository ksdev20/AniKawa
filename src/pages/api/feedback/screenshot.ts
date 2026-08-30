import type { APIRoute } from "astro";

import { createServerSupabaseClient } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const prerender = false;

const BUCKET_NAME = "episode-feedback";

const MAX_SCREENSHOT_SIZE = 5 * 1024 * 1024;

export const POST: APIRoute = async (context) => {
  const { request } = context;
  try {
    const contentType = request.headers.get("content-type") ?? "";

    if (!contentType.includes("multipart/form-data")) {
      return new Response(
        JSON.stringify({
          error: "Invalid content type.",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    const formData = await request.formData();

    const feedbackId = formData.get("feedbackId");
    const guestId = formData.get("guestId");
    const screenshot = formData.get("screenshot");

    if (typeof feedbackId !== "string" || !(screenshot instanceof File)) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields.",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    if (screenshot.type !== "image/webp") {
      return new Response(
        JSON.stringify({
          error: "Screenshot must be a WebP image.",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    if (screenshot.size > MAX_SCREENSHOT_SIZE) {
      return new Response(
        JSON.stringify({
          error: "Screenshot is too large.",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    const supabase = createServerSupabaseClient(context);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error("Failed to get authenticated user:", userError);
    }

    const { data: feedback, error: feedbackError } = await supabaseAdmin
      .from("episode_feedback")
      .select("id, user_id, guest_id, screenshot_path")
      .eq("id", feedbackId)
      .maybeSingle();

    if (feedbackError) {
      throw feedbackError;
    }

    if (!feedback) {
      return new Response(
        JSON.stringify({
          error: "Feedback not found.",
        }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    const isAuthenticatedOwner = user !== null && feedback.user_id === user.id;

    const isGuestOwner =
      user === null &&
      feedback.user_id === null &&
      typeof guestId === "string" &&
      guestId.length > 0 &&
      feedback.guest_id === guestId;

    if (!isAuthenticatedOwner && !isGuestOwner) {
      return new Response(
        JSON.stringify({
          error: "You are not allowed to upload this screenshot.",
        }),
        {
          status: 403,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    if (feedback.screenshot_path) {
      return new Response(
        JSON.stringify({
          error: "A screenshot already exists for this feedback.",
        }),
        {
          status: 409,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    const filePath = `${feedbackId}.webp`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .upload(filePath, screenshot, {
        contentType: "image/webp",
        upsert: false,
      });

    if (uploadError) {
      throw uploadError;
    }

    const { error: updateError } = await supabaseAdmin
      .from("episode_feedback")
      .update({
        screenshot_path: filePath,
      })
      .eq("id", feedbackId);

    if (updateError) {
      await supabaseAdmin.storage.from(BUCKET_NAME).remove([filePath]);

      throw updateError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        screenshotPath: filePath,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    console.error("Failed to upload feedback screenshot:", error);

    return new Response(
      JSON.stringify({
        error: "Failed to upload screenshot.",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
};
