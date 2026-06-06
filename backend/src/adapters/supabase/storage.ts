import type { StorageGateway, SignedImageUpload, SignedFileUpload } from '../../domain';
import { supabaseAdmin } from './client';
import { env } from '../../env';
import crypto from 'crypto';

export class SupabaseStorageGateway implements StorageGateway {
  async signImageUpload(input: { folder?: string }): Promise<SignedImageUpload> {
    const timestamp = Math.floor(Date.now() / 1000);
    const folder = input.folder || 'covers';

    const params: Record<string, any> = {
      folder,
      timestamp,
      upload_preset: env.CLOUDINARY_UPLOAD_PRESET || 'mw_signed',
    };

    const sortedKeys = Object.keys(params).sort();
    const serialized = sortedKeys.map((k) => `${k}=${params[k]}`).join('&');
    
    const apiSecret = env.CLOUDINARY_API_SECRET || '';
    const signature = crypto
      .createHash('sha1')
      .update(serialized + apiSecret)
      .digest('hex');

    return {
      signature,
      timestamp,
      apiKey: env.CLOUDINARY_API_KEY || '',
      cloudName: env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '',
      uploadPreset: env.CLOUDINARY_UPLOAD_PRESET || 'mw_signed',
      folder,
    };
  }

  async signFileUpload(input: { path: string; contentType?: string }): Promise<SignedFileUpload> {
    const { data, error } = await supabaseAdmin.storage
      .from('freebies')
      .createSignedUploadUrl(input.path);

    if (error || !data) {
      throw error || new Error('Failed to create signed upload URL');
    }

    return {
      uploadUrl: data.signedUrl,
      path: input.path,
      token: data.token,
    };
  }

  async uploadImage(imageUrl: string, options?: { folder?: string }): Promise<string> {
    const timestamp = Math.floor(Date.now() / 1000);
    const folder = options?.folder || 'articles';

    const params: Record<string, any> = {
      folder,
      timestamp,
      upload_preset: env.CLOUDINARY_UPLOAD_PRESET || 'mw_signed',
    };

    const sortedKeys = Object.keys(params).sort();
    const serialized = sortedKeys.map((k) => `${k}=${params[k]}`).join('&');

    const apiSecret = env.CLOUDINARY_API_SECRET || '';
    const signature = crypto
      .createHash('sha1')
      .update(serialized + apiSecret)
      .digest('hex');

    const formData = new FormData();
    formData.append('file', imageUrl);
    formData.append('folder', folder);
    formData.append('timestamp', timestamp.toString());
    formData.append('upload_preset', env.CLOUDINARY_UPLOAD_PRESET || 'mw_signed');
    formData.append('api_key', env.CLOUDINARY_API_KEY || '');
    formData.append('signature', signature);

    const cloudName = env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '';
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Cloudinary upload failed: ${errText}`);
    }

    const data = await res.json();
    return data.secure_url;
  }
}
