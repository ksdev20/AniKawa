import { supabase } from "@/lib/supabase";

export async function uploadFeedbackScreenshot(
  feedbackId: string,
  screenshot: Blob,
): Promise<string> {
  const filePath = `${feedbackId}.webp`;

  const { error } = await supabase.storage
    .from("episode-feedback")
    .upload(filePath, screenshot, {
      contentType: "image/webp",
      upsert: false,
    });

  if (error) {
    throw error;
  }

  return filePath;
}
