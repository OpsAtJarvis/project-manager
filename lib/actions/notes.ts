'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@clerk/nextjs/server';
import { createServiceSupabaseClient } from '@/lib/supabase/server';

export async function createNote(projectId: string, content: string) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { error: 'Unauthorized' };
    }

    if (!content.trim()) {
      return { error: 'Note content is required' };
    }

    const supabase = createServiceSupabaseClient();

    const { data, error } = await supabase
      .from('project_notes')
      .insert({
        project_id: projectId,
        user_id: userId,
        content: content.trim(),
      })
      .select(`
        *,
        user:users!project_notes_user_id_fkey(id, email, first_name, last_name, avatar_url)
      `)
      .single();

    if (error) {
      console.error('Create note error:', error);
      return { error: 'Failed to create note' };
    }

    revalidatePath(`/projects/${projectId}`);
    return { data, error: null };
  } catch (error) {
    console.error('Create note error:', error);
    return { error: 'Failed to create note' };
  }
}

export async function getNotes(projectId: string) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { data: [], error: 'Unauthorized' };
    }

    const supabase = createServiceSupabaseClient();

    const { data, error } = await supabase
      .from('project_notes')
      .select(`
        *,
        user:users!project_notes_user_id_fkey(id, email, first_name, last_name, avatar_url)
      `)
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get notes error:', error);
      return { data: [], error: 'Failed to fetch notes' };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Get notes error:', error);
    return { data: [], error: 'Failed to fetch notes' };
  }
}

export async function deleteNote(noteId: string, projectId: string) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { error: 'Unauthorized' };
    }

    const supabase = createServiceSupabaseClient();

    // Verify user owns the note
    const { data: note } = await supabase
      .from('project_notes')
      .select('user_id')
      .eq('id', noteId)
      .single();

    if (!note || note.user_id !== userId) {
      return { error: 'Unauthorized to delete this note' };
    }

    const { error } = await supabase
      .from('project_notes')
      .delete()
      .eq('id', noteId);

    if (error) {
      console.error('Delete note error:', error);
      return { error: 'Failed to delete note' };
    }

    revalidatePath(`/projects/${projectId}`);
    return { error: null };
  } catch (error) {
    console.error('Delete note error:', error);
    return { error: 'Failed to delete note' };
  }
}
