'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@clerk/nextjs/server';
import { createServiceSupabaseClient } from '@/lib/supabase/server';

export async function createProject(formData: FormData) {
  try {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return { error: 'Unauthorized' };
    }

    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const start_date = formData.get('start_date') as string;
    const due_date = formData.get('due_date') as string;
    const assigned_to = formData.get('assigned_to') as string;

    if (!name) {
      return { error: 'Project name is required' };
    }

    // Use service client to bypass RLS for organization lookup
    const serviceClient = createServiceSupabaseClient();

    // Get organization UUID from clerk_org_id
    const { data: org, error: orgError } = await serviceClient
      .from('organizations')
      .select('id')
      .eq('clerk_org_id', orgId)
      .single();

    if (orgError || !org) {
      console.error('Organization lookup error:', orgError, 'orgId:', orgId);
      return { error: 'Organization not found' };
    }

    // Use service client for database operations (server actions are trusted)
    const { data, error } = await serviceClient
      .from('projects')
      .insert({
        org_id: org.id,
        name,
        description: description || null,
        status: 'active',
        owner_id: userId,
        start_date: start_date || null,
        due_date: due_date || null,
        assigned_to: assigned_to || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Create project error:', error);
      return { error: 'Failed to create project' };
    }

    // Add owner as project member
    await serviceClient.from('project_members').insert({
      project_id: data.id,
      user_id: userId,
    });

    // If assigned to someone else, add them as member too
    if (assigned_to && assigned_to !== userId) {
      await serviceClient.from('project_members').insert({
        project_id: data.id,
        user_id: assigned_to,
      });
    }

    revalidatePath('/projects');
    return { data, error: null };
  } catch (error) {
    console.error('Create project error:', error);
    return { error: 'Failed to create project' };
  }
}

export async function updateProject(
  projectId: string,
  formData: FormData
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { error: 'Unauthorized' };
    }

    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const status = formData.get('status') as string;
    const start_date = formData.get('start_date') as string;
    const due_date = formData.get('due_date') as string;
    const assigned_to = formData.get('assigned_to') as string;

    const serviceClient = createServiceSupabaseClient();

    const { data, error } = await serviceClient
      .from('projects')
      .update({
        name,
        description: description || null,
        status: status || 'active',
        start_date: start_date || null,
        due_date: due_date || null,
        assigned_to: assigned_to || null,
      })
      .eq('id', projectId)
      .select()
      .single();

    if (error) {
      console.error('Update project error:', error);
      return { error: 'Failed to update project' };
    }

    revalidatePath('/projects');
    revalidatePath(`/projects/${projectId}`);
    return { data, error: null };
  } catch (error) {
    console.error('Update project error:', error);
    return { error: 'Failed to update project' };
  }
}

export async function deleteProject(projectId: string) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { error: 'Unauthorized' };
    }

    const serviceClient = createServiceSupabaseClient();

    // Check if user is the owner
    const { data: project, error: fetchError } = await serviceClient
      .from('projects')
      .select('owner_id')
      .eq('id', projectId)
      .single();

    if (fetchError || !project) {
      return { error: 'Project not found' };
    }

    if (project.owner_id !== userId) {
      return { error: 'Only project owner can delete the project' };
    }

    const { error } = await serviceClient
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (error) {
      console.error('Delete project error:', error);
      return { error: 'Failed to delete project' };
    }

    revalidatePath('/projects');
    return { error: null };
  } catch (error) {
    console.error('Delete project error:', error);
    return { error: 'Failed to delete project' };
  }
}

export async function getProjects() {
  try {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return { data: [], error: 'Unauthorized' };
    }

    // Use service client to bypass RLS for organization lookup
    const serviceClient = createServiceSupabaseClient();

    // Get organization UUID
    const { data: org } = await serviceClient
      .from('organizations')
      .select('id')
      .eq('clerk_org_id', orgId)
      .single();

    if (!org) {
      return { data: [], error: 'Organization not found' };
    }

    // Use service client for database operations (server actions are trusted)
    const { data, error } = await serviceClient
      .from('projects')
      .select(`
        *,
        owner:users!projects_owner_id_fkey(id, email, first_name, last_name, avatar_url)
      `)
      .eq('org_id', org.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get projects error:', error);
      return { data: [], error: 'Failed to fetch projects' };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Get projects error:', error);
    return { data: [], error: 'Failed to fetch projects' };
  }
}

export async function getProject(projectId: string) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { data: null, error: 'Unauthorized' };
    }

    const serviceClient = createServiceSupabaseClient();

    const { data, error } = await serviceClient
      .from('projects')
      .select(`
        *,
        owner:users!projects_owner_id_fkey(id, email, first_name, last_name, avatar_url),
        documents(*)
      `)
      .eq('id', projectId)
      .single();

    if (error) {
      console.error('Get project error:', error);
      return { data: null, error: 'Failed to fetch project' };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Get project error:', error);
    return { data: null, error: 'Failed to fetch project' };
  }
}
