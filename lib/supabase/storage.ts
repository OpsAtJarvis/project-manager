import { createServiceSupabaseClient } from './server';

const BUCKET_NAME = 'project-documents';

export async function uploadDocument(
  file: File,
  projectId: string,
  userId: string
): Promise<{ path: string; error: string | null }> {
  try {
    console.log('uploadDocument called:', { projectId, userId, fileName: file.name, fileSize: file.size });

    // Use service client for storage operations (bypasses JWT issues)
    const supabase = createServiceSupabaseClient();

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${projectId}/${fileName}`;

    console.log('Uploading to path:', filePath);

    // Convert File to ArrayBuffer for server-side upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, buffer, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return { path: '', error: uploadError.message };
    }

    console.log('Upload successful, path:', filePath);
    return { path: filePath, error: null };
  } catch (error) {
    console.error('Upload exception:', error);
    return { path: '', error: 'Failed to upload file: ' + (error as Error).message };
  }
}

export async function downloadDocument(
  filePath: string
): Promise<{ url: string | null; error: string | null }> {
  try {
    const supabase = createServiceSupabaseClient();

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(filePath, 3600); // 1 hour expiry

    if (error) {
      console.error('Download error:', error);
      return { url: null, error: error.message };
    }

    return { url: data.signedUrl, error: null };
  } catch (error) {
    console.error('Download error:', error);
    return { url: null, error: 'Failed to download file' };
  }
}

export async function deleteDocument(
  filePath: string
): Promise<{ error: string | null }> {
  try {
    const supabase = createServiceSupabaseClient();

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (error) {
      console.error('Delete error:', error);
      return { error: error.message };
    }

    return { error: null };
  } catch (error) {
    console.error('Delete error:', error);
    return { error: 'Failed to delete file' };
  }
}

export async function getDocumentUrl(filePath: string): Promise<string | null> {
  const supabase = createServiceSupabaseClient();

  const { data } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);

  return data.publicUrl;
}
