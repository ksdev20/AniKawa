import { useRef, useState } from "react";

import { Icon } from "@/icons/icons";
interface Props {
  profile: any;

  onUpdate: (profile: any) => void;
}

export default function AvatarUploader({ profile, onUpdate }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [preview, setPreview] = useState<string | null>(
    profile?.avatar_url ?? null,
  );

  const [uploading, setUploading] = useState(false);

  async function upload(file: File) {
    const objectUrl = URL.createObjectURL(file);

    setPreview(objectUrl);

    const form = new FormData();

    form.append("file", file);
    form.append("type", "avatar");

    setUploading(true);

    try {
      const res = await fetch("/api/profile/upload", {
        method: "POST",
        body: form,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Avatar upload failed");
      }

      /*
        Update global profile state
        so hero/navbar/settings update instantly
      */

      onUpdate(data.profile);

      setPreview(`${data.url}&t=${Date.now()}`);
    } catch (error) {
      console.error("[Avatar Upload]", error);

      // rollback
      setPreview(null);
    } finally {
      setUploading(false);
    }
  }

  function handleFile(file?: File) {
    if (!file) return;

    if (!file.type.startsWith("image/")) return;

    upload(file);
  }

  return (
    <section className="settings-card">
      <div className="settings-card__header">
        <div>
          <h3>Profile Picture</h3>

          <p>
            Upload an avatar that represents you across the AniKawa community.
          </p>
        </div>

        <span className="settings-badge">Identity</span>
      </div>

      <div
        className={`
          profile-dropzone
          profile-dropzone--avatar
          ${uploading ? "is-uploading" : ""}
        `}

        onClick={() => inputRef.current?.click()}

        onDragOver={(e) => e.preventDefault()}

        onDrop={(e) => {
          e.preventDefault();

          handleFile(e.dataTransfer.files?.[0]);
        }}
      >
        {preview ? (
          <img
            src={preview}
            className="
              profile-preview
              profile-preview--avatar
            "
            alt="Profile avatar"
          />
        ) : (
          <div className="profile-placeholder">
            <div className="upload-icon">
              <Icon name="upload" size={36} />
            </div>

            <h4>Drag your avatar here</h4>

            <p>or click to browse your device</p>

            <span>JPG • PNG • WEBP • Max 5MB</span>
          </div>
        )}

        {uploading && <div className="upload-overlay">Uploading avatar...</div>}
      </div>

      <input
        ref={inputRef}
        hidden
        type="file"
        accept="image/*"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </section>
  );
}
