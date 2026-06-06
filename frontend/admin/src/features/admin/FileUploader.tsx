"use client";
import { useRef, useState } from "react";
import { Upload, FileText, X } from "lucide-react";

interface FileUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  bucket?: string;
  accept?: string;
  label?: string;
}

export function FileUploader({
  value,
  onChange,
  bucket = "freebies",
  accept = ".pdf,.epub",
  label = "File",
}: FileUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputId = "file-upload";

  async function handleFile(file: File) {
    setUploading(true);
    setError(null);
    try {
      // Get signed upload URL from our server
      const sigRes = await fetch("/api/upload-sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "file", bucket }),
      });
      if (!sigRes.ok) throw new Error("Failed to get upload URL");
      const sig = await sigRes.json() as {
        signedUrl: string; path: string; bucket: string;
      };

      // Upload directly to Supabase Storage (§17.7) — server never sees the bytes
      const uploadRes = await fetch(sig.signedUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type || "application/octet-stream" },
        body: file,
      });
      if (!uploadRes.ok) throw new Error("Upload failed");

      // Build a public URL or return the storage path so server action can sign it
      const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${sig.bucket}/${sig.path}`;
      onChange(publicUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  const filename = value ? value.split("/").pop() : undefined;

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
        accept={accept}
        className="sr-only"
        aria-label={`Upload ${label}`}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {value ? (
        <div className="flex items-center gap-2 p-3 rounded-md border border-border bg-bg">
          <FileText size={16} className="text-primary shrink-0" aria-hidden="true" />
          <span className="text-sm text-text flex-1 truncate">{filename}</span>
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-muted hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
            aria-label="Remove file"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 h-9 px-4 rounded-md border border-border text-sm text-text hover:bg-bg disabled:opacity-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <Upload size={14} aria-hidden="true" />
          {uploading ? "Uploading…" : "Upload file"}
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
