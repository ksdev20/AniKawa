import { useEditor, EditorContent } from "@tiptap/react";

import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";

import "@/styles/components/Profile/about-viewer.css";

export default function AboutViewer({ about }: { about: string | null }) {
  const editor = useEditor({
    immediatelyRender: false,

    editable: false,

    extensions: [
      StarterKit,

      Image,

      Link.configure({
        openOnClick: false,
      }),

      Highlight,

      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],

    content: parseAbout(about),
  });

  if (!editor) return null;

  return (
    <div className="about-viewer">
      <EditorContent editor={editor} />
    </div>
  );
}

function parseAbout(about: string | null) {
  if (!about) return "";

  try {
    return JSON.parse(about);
  } catch (error) {
    console.error("[AboutViewer] Failed to parse about:", error);
    return "";
  }
}
