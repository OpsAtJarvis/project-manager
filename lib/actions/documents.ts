'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@clerk/nextjs/server';
import { createServiceSupabaseClient } from '@/lib/supabase/server';
import { uploadDocument, deleteDocument as deleteDocumentFile } from '@/lib/supabase/storage';

export async function createDocument(formData: FormData) {
  try {
    const { userId } = await auth();

    console.log('createDocument called, userId:', userId);

    if (!userId) {
      return { error: 'Unauthorized' };
    }

    const projectId = formData.get('projectId') as string;
    const file = formData.get('file') as File;

    console.log('projectId:', projectId);
    console.log('file:', file ? { name: file.name, size: file.size, type: file.type } : 'null');

    if (!projectId || !file) {
      return { error: 'Project ID and file are required' };
    }

    // Upload file to storage
    console.log('Uploading to storage...');
    const { path, error: uploadError } = await uploadDocument(
      file,
      projectId,
      userId
    );

    console.log('Upload result:', { path, error: uploadError });

    if (uploadError) {
      return { error: uploadError };
    }

    const supabase = createServiceSupabaseClient();

    // Create document record
    console.log('Inserting document record...');
    const { data, error } = await supabase
      .from('documents')
      .insert({
        project_id: projectId,
        name: file.name,
        file_path: path,
        file_size: file.size,
        file_type: file.type,
        status: 'draft',
        uploaded_by: userId,
      })
      .select()
      .single();

    if (error) {
      console.error('Create document DB error:', error);
      // Clean up uploaded file if database insert fails
      await deleteDocumentFile(path);
      return { error: 'Failed to create document record: ' + error.message };
    }

    console.log('Document created successfully:', data);
    revalidatePath(`/projects/${projectId}`);
    return { data, error: null };
  } catch (error) {
    console.error('Create document exception:', error);
    return { error: 'Failed to create document: ' + (error as Error).message };
  }
}

export async function updateDocumentStatus(
  documentId: string,
  status: string
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { error: 'Unauthorized' };
    }

    const supabase = createServiceSupabaseClient();

    const { data, error } = await supabase
      .from('documents')
      .update({ status })
      .eq('id', documentId)
      .select()
      .single();

    if (error) {
      console.error('Update document error:', error);
      return { error: 'Failed to update document' };
    }

    revalidatePath(`/projects/${data.project_id}`);
    return { data, error: null };
  } catch (error) {
    console.error('Update document error:', error);
    return { error: 'Failed to update document' };
  }
}

export async function deleteDocument(documentId: string) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { error: 'Unauthorized' };
    }

    const supabase = createServiceSupabaseClient();

    // Get document details first
    const { data: document, error: fetchError } = await supabase
      .from('documents')
      .select('file_path, project_id, uploaded_by')
      .eq('id', documentId)
      .single();

    if (fetchError || !document) {
      return { error: 'Document not found' };
    }

    // Delete from storage
    await deleteDocumentFile(document.file_path);

    // Delete from database
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId);

    if (error) {
      console.error('Delete document error:', error);
      return { error: 'Failed to delete document' };
    }

    revalidatePath(`/projects/${document.project_id}`);
    return { error: null };
  } catch (error) {
    console.error('Delete document error:', error);
    return { error: 'Failed to delete document' };
  }
}

export async function getDocuments(projectId: string) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { data: [], error: 'Unauthorized' };
    }

    const supabase = createServiceSupabaseClient();

    const { data, error } = await supabase
      .from('documents')
      .select(`
        *,
        uploader:users!documents_uploaded_by_fkey(id, email, first_name, last_name, avatar_url)
      `)
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get documents error:', error);
      return { data: [], error: 'Failed to fetch documents' };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Get documents error:', error);
    return { data: [], error: 'Failed to fetch documents' };
  }
}
