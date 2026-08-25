import type { APIRoute } from "astro";

import { processProfileImage } from "@/global_assets/processImage";

const BUCKET = "profile-assets";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

type UploadType = "avatar" | "banner";

function json(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

function isUploadType(value: FormDataEntryValue | null): value is UploadType {
  return value === "avatar" || value === "banner";
}

function isFile(value: FormDataEntryValue | null): value is File {
  return value instanceof File;
}

export const POST: APIRoute = async ({ request, locals }) => {
  /*
   * --------------------------------------------------------------------
   * Method
   * --------------------------------------------------------------------
   */

  if (request.method !== "POST") {
    return json(
      {
        error: "Method not allowed",
      },
      405,
    );
  }

  /*
   * --------------------------------------------------------------------
   * Authentication
   * --------------------------------------------------------------------
   */

  const { supabase } = locals;

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return json(
      {
        error: "Unauthorized",
      },
      401,
    );
  }

  /*
   * --------------------------------------------------------------------
   * Parse form data
   * --------------------------------------------------------------------
   */

  let formData: FormData;

  try {
    formData = await request.formData();
  } catch (error) {
    console.error("[PROFILE UPLOAD] Failed to parse form data:", error);

    return json(
      {
        error: "Invalid form data",
      },
      400,
    );
  }

  const fileValue = formData.get("file");
  const typeValue = formData.get("type");

  /*
   * --------------------------------------------------------------------
   * Validate upload type
   * --------------------------------------------------------------------
   */

  if (!isUploadType(typeValue)) {
    return json(
      {
        error: "Invalid upload type",
      },
      400,
    );
  }

  /*
   * --------------------------------------------------------------------
   * Validate file
   * --------------------------------------------------------------------
   */

  if (!isFile(fileValue)) {
    return json(
      {
        error: "A valid image file is required",
      },
      400,
    );
  }

  const file = fileValue;

  if (file.size <= 0) {
    return json(
      {
        error: "The uploaded file is empty",
      },
      400,
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return json(
      {
        error: "Maximum file size is 5MB",
      },
      413,
    );
  }

  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return json(
      {
        error: "Only JPG, PNG and WEBP images are allowed",
      },
      415,
    );
  }

  /*
   * --------------------------------------------------------------------
   * Process image
   * --------------------------------------------------------------------
   *
   * processProfileImage returns a Node Buffer.
   */

  let processedImage: Awaited<ReturnType<typeof processProfileImage>>;

  try {
    processedImage = await processProfileImage(file, typeValue);
  } catch (error) {
    console.error("[PROFILE UPLOAD] Image processing failed:", error);

    return json(
      {
        error: "Unable to process this image",
      },
      422,
    );
  }

  /*
   * --------------------------------------------------------------------
   * Validate processed image
   * --------------------------------------------------------------------
   */

  if (!processedImage || processedImage.length === 0) {
    console.error("[PROFILE UPLOAD] Image processor returned an empty result");

    return json(
      {
        error: "Image processing failed",
      },
      500,
    );
  }

  /*
   * --------------------------------------------------------------------
   * Storage path
   * --------------------------------------------------------------------
   *
   * IMPORTANT:
   * The user ID comes from the authenticated session.
   *
   * The client never controls this path.
   */

  const filePath =
    typeValue === "avatar"
      ? `${user.id}/avatar.webp`
      : `${user.id}/banner.webp`;

  /*
   * --------------------------------------------------------------------
   * Upload
   * --------------------------------------------------------------------
   */

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, processedImage, {
      contentType: "image/webp",
      upsert: true,
      cacheControl: "31536000",
    });

  if (uploadError) {
    console.error("[PROFILE UPLOAD] Storage upload failed:", uploadError);

    return json(
      {
        error: "Failed to upload image",
      },
      500,
    );
  }

  /*
   * --------------------------------------------------------------------
   * Public URL
   * --------------------------------------------------------------------
   */

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(filePath);

  if (!publicUrl) {
    console.error("[PROFILE UPLOAD] Failed to generate public URL");

    return json(
      {
        error: "Failed to generate image URL",
      },
      500,
    );
  }

  /*
   * --------------------------------------------------------------------
   * Cache bust
   * --------------------------------------------------------------------
   */

  const cacheBustedUrl = `${publicUrl}?v=${Date.now()}`;

  /*
   * --------------------------------------------------------------------
   * Update profile
   * --------------------------------------------------------------------
   *
   * Do NOT use:
   *
   *   { [column]: cacheBustedUrl }
   *
   * Your generated Supabase types reject dynamic string keys.
   *
   * Explicit branches keep this completely type-safe.
   */

  if (typeValue === "avatar") {
    const { data: profile, error: updateError } = await supabase
      .from("profiles")
      .update({
        avatar_url: cacheBustedUrl,
      })
      .eq("id", user.id)
      .select()
      .single();

    if (updateError) {
      console.error(
        "[PROFILE UPLOAD] Avatar profile update failed:",
        updateError,
      );

      return json(
        {
          error: "Image uploaded but profile update failed",
        },
        500,
      );
    }

    return json({
      url: cacheBustedUrl,
      profile,
    });
  }

  /*
   * --------------------------------------------------------------------
   * Banner
   * --------------------------------------------------------------------
   */

  const { data: profile, error: updateError } = await supabase
    .from("profiles")
    .update({
      banner_url: cacheBustedUrl,
    })
    .eq("id", user.id)
    .select()
    .single();

  if (updateError) {
    console.error(
      "[PROFILE UPLOAD] Banner profile update failed:",
      updateError,
    );

    return json(
      {
        error: "Image uploaded but profile update failed",
      },
      500,
    );
  }

  return json({
    url: cacheBustedUrl,
    profile,
  });
};
