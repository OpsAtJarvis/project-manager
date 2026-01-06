'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@clerk/nextjs/server';
import { createServiceSupabaseClient } from '@/lib/supabase/server';

export async function addProjectMember(projectId: string, userId: string) {
  try {
    const { userId: currentUserId } = await auth();

    if (!currentUserId) {
      return { error: 'Unauthorized' };
    }

    const supabase = createServiceSupabaseClient();

    // Check if current user is the project owner
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('owner_id')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      return { error: 'Project not found' };
    }

    if (project.owner_id !== currentUserId) {
      return { error: 'Only project owner can add members' };
    }

    // Add member
    const { data, error } = await supabase
      .from('project_members')
      .insert({
        project_id: projectId,
        user_id: userId,
      })
      .select()
      .single();

    if (error) {
      console.error('Add member error:', error);
      return { error: 'Failed to add member' };
    }

    revalidatePath(`/projects/${projectId}`);
    return { data, error: null };
  } catch (error) {
    console.error('Add member error:', error);
    return { error: 'Failed to add member' };
  }
}

export async function removeProjectMember(projectId: string, userId: string) {
  try {
    const { userId: currentUserId } = await auth();

    if (!currentUserId) {
      return { error: 'Unauthorized' };
    }

    const supabase = createServiceSupabaseClient();

    // Check if current user is the project owner
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('owner_id')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      return { error: 'Project not found' };
    }

    if (project.owner_id !== currentUserId) {
      return { error: 'Only project owner can remove members' };
    }

    // Don't allow removing the owner
    if (userId === project.owner_id) {
      return { error: 'Cannot remove project owner' };
    }

    const { error } = await supabase
      .from('project_members')
      .delete()
      .eq('project_id', projectId)
      .eq('user_id', userId);

    if (error) {
      console.error('Remove member error:', error);
      return { error: 'Failed to remove member' };
    }

    revalidatePath(`/projects/${projectId}`);
    return { error: null };
  } catch (error) {
    console.error('Remove member error:', error);
    return { error: 'Failed to remove member' };
  }
}

export async function getProjectMembers(projectId: string) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { data: [], error: 'Unauthorized' };
    }

    const supabase = createServiceSupabaseClient();

    const { data, error } = await supabase
      .from('project_members')
      .select(`
        *,
        user:users!project_members_user_id_fkey(id, email, first_name, last_name, avatar_url)
      `)
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get members error:', error);
      return { data: [], error: 'Failed to fetch members' };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Get members error:', error);
    return { data: [], error: 'Failed to fetch members' };
  }
}

export async function getOrgMembers() {
  try {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return { data: [], error: 'Unauthorized' };
    }

    const supabase = createServiceSupabaseClient();

    // Get organization UUID
    const { data: org } = await supabase
      .from('organizations')
      .select('id')
      .eq('clerk_org_id', orgId)
      .single();

    if (!org) {
      return { data: [], error: 'Organization not found' };
    }

    const { data, error } = await supabase
      .from('org_members')
      .select(`
        *,
        user:users!org_members_user_id_fkey(id, email, first_name, last_name, avatar_url)
      `)
      .eq('org_id', org.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get org members error:', error);
      return { data: [], error: 'Failed to fetch organization members' };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Get org members error:', error);
    return { data: [], error: 'Failed to fetch organization members' };
  }
}
