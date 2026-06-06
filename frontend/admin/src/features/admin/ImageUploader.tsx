"use client";
import { useRef, useState } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";

interface ImageUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
}

export function ImageUploader({
  value,
  onChange,
  folder = "masterwithin/covers",
  label = "Cover image",
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputId = "img-upload";

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }
    setUploading(true);
    setError(null);
    try {
      // Get signed params from our server
      const sigRes = await fetch("/api/upload-sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "image", folder }),
      });
      if (!sigRes.ok) throw new Error("Failed to get upload signature");
      const sig = await sigRes.json() as {
        signature: string; timestamp: number; upload_preset: string;
        folder: string; api_key: string; cloud_name: string;
      };

      // Upload directly to Cloudinary (§17.7) — server never sees the bytes
      const form = new FormData();
      form.append("file", file);
      form.append("upload_preset", sig.upload_preset);
      form.append("api_key", sig.api_key);
      form.append("timestamp", String(sig.timestamp));
      form.append("signature", sig.signature);
      form.append("folder", sig.folder);

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${sig.cloud_name}/image/upload`,
        { method: "POST", body: form }
      );
      if (!uploadRes.ok) throw new Error("Upload failed");
      const result = await uploadRes.json() as { secure_url: string };
      onChange(result.secure_url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <label
        htmlFor={inputId}
        className="block text-sm font-medium text-text mb-1.5"
      >
        {label}
      </label>

      <input
        id={inputId}
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        aria-label={`Upload ${label}`}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {value ? (
        <div className="relative inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Cover preview"
            width={120}
            height={160}
            className="rounded-md border border-border object-cover"
            style={{ width: 120, height: 160 }}
          />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-danger text-surface flex items-center justify-center hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Remove image"
          >
            <X size={11} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex flex-col items-center justify-center w-full h-36 rounded-md border-2 border-dashed border-border hover:border-primary text-muted hover:text-primary transition-colors disabled:opacity-50 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          {uploading ? (
            <span className="text-sm">Uploading…</span>
          ) : (
            <>
              <ImageIcon size={24} aria-hidden="true" className="mb-2" />
              <span className="text-sm">Click to upload</span>
              <span className="text-xs mt-1">PNG, JPG, WebP</span>
            </>
          )}
        </button>
      )}

      {!value && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="mt-2 flex items-center gap-1.5 text-xs text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded disabled:opacity-50"
        >
          <Upload size={12} aria-hidden="true" />
          {uploading ? "Uploading…" : "Browse files"}
        </button>
      )}

      {error && (
        <p role="alert" aria-live="polite" className="mt-1 text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
