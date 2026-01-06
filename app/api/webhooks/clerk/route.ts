import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { createServiceSupabaseClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET to .env.local');
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occurred -- no svix headers', {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occurred', {
      status: 400,
    });
  }

  const eventType = evt.type;
  const supabase = createServiceSupabaseClient();

  try {
    if (eventType === 'user.created' || eventType === 'user.updated') {
      const { id, email_addresses, first_name, last_name, image_url } = evt.data;

      const email = email_addresses[0]?.email_address;

      if (!email) {
        return new Response('No email found', { status: 400 });
      }

      // Upsert user in Supabase
      const { error } = await supabase.from('users').upsert({
        id,
        email,
        first_name: first_name || null,
        last_name: last_name || null,
        avatar_url: image_url || null,
        updated_at: new Date().toISOString(),
      } as any);

      if (error) {
        console.error('Error upserting user:', error);
        return new Response('Error upserting user', { status: 500 });
      }
    }

    if (eventType === 'organization.created' || eventType === 'organization.updated') {
      const { id, name, slug } = evt.data;

      // Upsert organization in Supabase
      const { error } = await supabase.from('organizations').upsert({
        clerk_org_id: id,
        name,
        slug,
        updated_at: new Date().toISOString(),
      } as any);

      if (error) {
        console.error('Error upserting organization:', error);
        return new Response('Error upserting organization', { status: 500 });
      }
    }

    if (eventType === 'organizationMembership.created') {
      const { organization, public_user_data } = evt.data;

      // Get organization UUID
      const { data: org } = await supabase
        .from('organizations')
        .select('id')
        .eq('clerk_org_id', organization.id)
        .single();

      if (!org) {
        return new Response('Organization not found', { status: 404 });
      }

      // Add organization member
      const { error } = await supabase.from('org_members').upsert({
        org_id: (org as any).id,
        user_id: public_user_data?.user_id || '',
        role: 'member',
      } as any);

      if (error) {
        console.error('Error adding org member:', error);
        return new Response('Error adding org member', { status: 500 });
      }
    }

    if (eventType === 'organizationMembership.deleted') {
      const { organization, public_user_data } = evt.data;

      // Get organization UUID
      const { data: org } = await supabase
        .from('organizations')
        .select('id')
        .eq('clerk_org_id', organization.id)
        .single();

      if (!org) {
        return new Response('Organization not found', { status: 404 });
      }

      // Remove organization member
      const { error } = await supabase
        .from('org_members')
        .delete()
        .eq('org_id', (org as any).id)
        .eq('user_id', public_user_data?.user_id || '');

      if (error) {
        console.error('Error removing org member:', error);
        return new Response('Error removing org member', { status: 500 });
      }
    }

    return new Response('Webhook processed', { status: 200 });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response('Error processing webhook', { status: 500 });
  }
}
