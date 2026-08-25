import sharp from "sharp";

export async function processProfileImage(
  file: File,
  type: "avatar" | "banner",
) {
  const buffer = Buffer.from(await file.arrayBuffer());

  let processor = sharp(buffer);

  if (type === "avatar") {
    processor = processor.resize(512, 512, {
      fit: "cover",
      position: "center",
    });
  }

  if (type === "banner") {
    processor = processor.resize(1500, 500, {
      fit: "cover",
      position: "center",
    });
  }

  const webpBuffer = await processor
    .webp({
      quality: 85,
    })
    .toBuffer();

  return webpBuffer;
}
