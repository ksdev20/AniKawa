import { toCanvas } from "html-to-image";

export async function capturePageScreenshot(): Promise<Blob | null> {
  try {
    const canvas = await toCanvas(document.body, {
      cacheBust: true,

      width: window.innerWidth,
      height: window.innerHeight,

      backgroundColor: "#141519",

      pixelRatio: Math.min(window.devicePixelRatio || 1, 2),

      skipFonts: true,

      style: {
        transform: `translate(${-window.scrollX}px, ${-window.scrollY}px)`,
      },

      filter: (node) => {
        if (!(node instanceof HTMLElement)) {
          return true;
        }

        return !node.classList.contains("episode-feedback-modal");
      },
    });

    return await new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), "image/webp", 0.8);
    });
  } catch (error) {
    console.error("Failed to capture feedback screenshot:", error);

    return null;
  }
}
