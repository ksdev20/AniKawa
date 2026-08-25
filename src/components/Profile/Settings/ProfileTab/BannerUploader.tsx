import { useRef, useState } from "react";
import { Icon } from "@/icons/icons";

interface Props {
  profile: {
    banner_url: string | null;
  };

  onUpdate: (profile: any) => void;
}

export default function BannerUploader({ profile, onUpdate }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [preview, setPreview] = useState<string | null>(
    profile.banner_url ?? null,
  );

  const [uploading, setUploading] = useState(false);

  async function upload(file: File) {
    const objectUrl = URL.createObjectURL(file);

    setPreview(objectUrl);

    const form = new FormData();

    form.append("file", file);

    form.append("type", "banner");

    setUploading(true);

    try {
      const res = await fetch("/api/profile/upload", {
        method: "POST",
        body: form,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Banner upload failed");
      }

      setPreview(`${data.url}&t=${Date.now()}`);

      onUpdate(data.profile);
    } catch (error) {
      console.error("[Banner Upload]", error);

      // rollback preview
      setPreview(null);
    } finally {
      setUploading(false);
    }
  }

  function handleFile(file?: File) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      return;
    }

    upload(file);
  }

  return (
    <section className="settings-card banner-uploader">
      <div className="settings-card__header">
        <div>
          <h3>Profile Banner</h3>

          <p>
            Upload a banner that represents your identity. Recommended size:
            1500 × 500px
          </p>
        </div>

        <span className="settings-badge">Appearance</span>
      </div>

      <div
        className={`
          banner-uploader__dropzone
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
            alt="Profile banner preview"
            className="banner-uploader__preview"
          />
        ) : (
          <div className="banner-uploader__placeholder">
            <div className="banner-uploader__icon">
              <Icon name="upload" size={38} />
            </div>

            <h4>Drag your banner here</h4>

            <p>or click to browse your device</p>

            <span>JPG • PNG • WEBP • Max 5MB</span>
          </div>
        )}

        {uploading && (
          <div className="banner-uploader__overlay">Uploading banner...</div>
        )}
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
