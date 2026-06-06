/**
 * StorageGateway port (§17.7).
 *
 * Uploads never stream through the server: the gateway issues short-lived signed
 * credentials and the browser uploads bytes directly to the provider. Images go to
 * Cloudinary; downloadable files (freebie PDFs) go to Supabase Storage (§2a, §17.7).
 */

/** Short-lived signed parameters for a direct browser → Cloudinary upload. */
export interface SignedImageUpload {
  /** HMAC signature of the upload params. */
  signature: string;
  /** Unix timestamp the signature was generated at. */
  timestamp: number;
  /** Cloudinary API key (publishable). */
  apiKey: string;
  /** Cloud name the browser posts to. */
  cloudName: string;
  /** The signed upload preset (§15 `CLOUDINARY_UPLOAD_PRESET`). */
  uploadPreset: string;
  /** Optional folder the asset is filed under. */
  folder?: string;
}

/** A short-lived signed URL for a direct browser → Supabase Storage upload. */
export interface SignedFileUpload {
  /** The one-time signed upload URL the browser PUTs the file to. */
  uploadUrl: string;
  /** Storage path the object will live at. */
  path: string;
  /** Token embedded in the signed URL. */
  token: string;
}

export interface StorageGateway {
  /** Issue signed params for a Cloudinary image upload (covers, article images). */
  signImageUpload(input: { folder?: string }): Promise<SignedImageUpload>;
  /** Issue a signed upload URL for a Supabase Storage file (freebie downloads). */
  signFileUpload(input: { path: string; contentType?: string }): Promise<SignedFileUpload>;
  /** Server-side mirror of a remote image URL to Cloudinary (ingest, §8). */
  uploadImage(imageUrl: string, options?: { folder?: string }): Promise<string>;
}

