import { useEditor, EditorContent } from "@tiptap/react";

import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";

import { useState } from "react";
import { toast } from "sonner";

import { WizardLoader } from "@/components/Loaders/WizardLoader";

interface Props {
  profile: {
    about: string | null;
  };

  onUpdate: (profile: any) => void;
}

const emptyContent = {
  type: "doc",
  content: [
    {
      type: "paragraph",
    },
  ],
};

export default function AboutEditor({ profile, onUpdate }: Props) {
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  let initialContent = emptyContent;

  if (profile.about) {
    try {
      initialContent = JSON.parse(profile.about);
    } catch (error) {
      console.error("[About Editor] Invalid stored content:", error);

      toast.error("Couldn't load your About content correctly.");
    }
  }

  const editor = useEditor({
    extensions: [
      StarterKit,

      Link.configure({
        openOnClick: false,
      }),

      Image,

      Highlight,

      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],

    content: initialContent,

    editorProps: {
      attributes: {
        class:
          "tiptap-content prose prose-invert max-w-none focus:outline-none",
      },
    },
  });

  async function save() {
    if (!editor || saving) return;

    setSaving(true);
    setSaveError(null);

    try {
      const res = await fetch("/api/profile/update", {
        method: "PATCH",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          about: JSON.stringify(editor.getJSON()),
        }),
      });

      let data: any;

      try {
        data = await res.json();
      } catch {
        throw new Error("The server returned an invalid response.");
      }

      if (!res.ok) {
        throw new Error(
          data?.error ||
            data?.message ||
            "Failed to update your About section.",
        );
      }

      if (!data?.profile) {
        throw new Error("Profile was updated, but no profile was returned.");
      }

      onUpdate(data.profile);

      toast.success("About section saved successfully.");
    } catch (error) {
      console.error("[About Save]", error);

      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong while saving your About section.";

      setSaveError(message);

      toast.error("Failed to save About section", {
        description: message,
      });
    } finally {
      setSaving(false);
    }
  }

  if (!editor) {
    return (
      <section className="settings-card">
        <WizardLoader info={["Loading Your About..."]} />
      </section>
    );
  }

  const runCommand = (command: () => boolean) => {
    if (saving) return;

    command();
  };

  return (
    <section className="settings-card">
      <div className="settings-card__header">
        <div>
          <h3>About You</h3>

          <p>Create your profile story with rich text.</p>
        </div>
      </div>

      <div className="tiptap-editor">
        <div className="tiptap-toolbar">
          <button
            type="button"
            title="Bold"
            aria-label="Bold"
            disabled={saving}
            onClick={() =>
              runCommand(() => editor.chain().focus().toggleBold().run())
            }
          >
            <b>B</b>
          </button>

          <button
            type="button"
            title="Italic"
            aria-label="Italic"
            disabled={saving}
            onClick={() =>
              runCommand(() => editor.chain().focus().toggleItalic().run())
            }
          >
            <i>I</i>
          </button>

          <button
            type="button"
            title="Strikethrough"
            aria-label="Strikethrough"
            disabled={saving}
            onClick={() =>
              runCommand(() => editor.chain().focus().toggleStrike().run())
            }
          >
            S
          </button>

          <button
            type="button"
            title="Inline code"
            aria-label="Inline code"
            disabled={saving}
            onClick={() =>
              runCommand(() => editor.chain().focus().toggleCode().run())
            }
          >
            {"</>"}
          </button>

          <button
            type="button"
            title="Heading 1"
            aria-label="Heading 1"
            disabled={saving}
            onClick={() =>
              runCommand(() =>
                editor.chain().focus().toggleHeading({ level: 1 }).run(),
              )
            }
          >
            H1
          </button>

          <button
            type="button"
            title="Heading 2"
            aria-label="Heading 2"
            disabled={saving}
            onClick={() =>
              runCommand(() =>
                editor.chain().focus().toggleHeading({ level: 2 }).run(),
              )
            }
          >
            H2
          </button>

          <button
            type="button"
            title="Bullet list"
            aria-label="Bullet list"
            disabled={saving}
            onClick={() =>
              runCommand(() => editor.chain().focus().toggleBulletList().run())
            }
          >
            • List
          </button>

          <button
            type="button"
            title="Ordered list"
            aria-label="Ordered list"
            disabled={saving}
            onClick={() =>
              runCommand(() => editor.chain().focus().toggleOrderedList().run())
            }
          >
            1.
          </button>

          <button
            type="button"
            title="Blockquote"
            aria-label="Blockquote"
            disabled={saving}
            onClick={() =>
              runCommand(() => editor.chain().focus().toggleBlockquote().run())
            }
          >
            ❝
          </button>

          <button
            type="button"
            title="Code block"
            aria-label="Code block"
            disabled={saving}
            onClick={() =>
              runCommand(() => editor.chain().focus().toggleCodeBlock().run())
            }
          >
            Code
          </button>

          <button
            type="button"
            title="Horizontal rule"
            aria-label="Horizontal rule"
            disabled={saving}
            onClick={() =>
              runCommand(() => editor.chain().focus().setHorizontalRule().run())
            }
          >
            ―
          </button>

          <button
            type="button"
            title="Add link"
            aria-label="Add link"
            disabled={saving}
            onClick={() => {
              const url = prompt("Enter URL");

              if (!url) return;

              runCommand(() =>
                editor.chain().focus().setLink({ href: url }).run(),
              );
            }}
          >
            🔗
          </button>

          <button
            type="button"
            title="Add image"
            aria-label="Add image"
            disabled={saving}
            onClick={() => {
              const url = prompt("Image URL");

              if (!url) return;

              runCommand(() =>
                editor.chain().focus().setImage({ src: url }).run(),
              );
            }}
          >
            🖼
          </button>

          <button
            type="button"
            title="Align left"
            aria-label="Align left"
            disabled={saving}
            onClick={() =>
              runCommand(() =>
                editor.chain().focus().setTextAlign("left").run(),
              )
            }
          >
            ⬅
          </button>

          <button
            type="button"
            title="Align center"
            aria-label="Align center"
            disabled={saving}
            onClick={() =>
              runCommand(() =>
                editor.chain().focus().setTextAlign("center").run(),
              )
            }
          >
            ↔
          </button>

          <button
            type="button"
            title="Align right"
            aria-label="Align right"
            disabled={saving}
            onClick={() =>
              runCommand(() =>
                editor.chain().focus().setTextAlign("right").run(),
              )
            }
          >
            ➡
          </button>

          <button
            type="button"
            title="Highlight"
            aria-label="Highlight"
            disabled={saving}
            onClick={() =>
              runCommand(() => editor.chain().focus().toggleHighlight().run())
            }
          >
            🖍
          </button>

          <button
            type="button"
            title="Clear formatting"
            aria-label="Clear formatting"
            disabled={saving}
            onClick={() =>
              runCommand(() =>
                editor.chain().focus().clearNodes().unsetAllMarks().run(),
              )
            }
          >
            Clear
          </button>

          <button
            type="button"
            title="Undo"
            aria-label="Undo"
            disabled={saving || !editor.can().undo()}
            onClick={() =>
              runCommand(() => editor.chain().focus().undo().run())
            }
          >
            ↶
          </button>

          <button
            type="button"
            title="Redo"
            aria-label="Redo"
            disabled={saving || !editor.can().redo()}
            onClick={() =>
              runCommand(() => editor.chain().focus().redo().run())
            }
          >
            ↷
          </button>
        </div>

        <EditorContent editor={editor} className="tiptap-content" />
      </div>

      {saveError && (
        <div
          role="alert"
          className="mt-3 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400"
        >
          {saveError}
        </div>
      )}

      <button
        type="button"
        className="settings-save"
        onClick={save}
        disabled={saving}
      >
        {saving ? "Saving..." : "Save About"}
      </button>
    </section>
  );
}
