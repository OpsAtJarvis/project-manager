import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { createClerkClient } from '@clerk/backend';

// Load environment variables from .env.local
const envPath = resolve(process.cwd(), '.env.local');
const envFile = readFileSync(envPath, 'utf-8');
envFile.split('\n').forEach(line => {
  const trimmedLine = line.trim();
  // Skip empty lines and comments
  if (!trimmedLine || trimmedLine.startsWith('#')) return;

  const match = trimmedLine.match(/^([^=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    const value = match[2].trim();
    process.env[key] = value;
  }
});

async function syncUsers() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const clerk = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY!,
  });

  // Get organization first
  const { data: orgs } = await clerk.organizations.getOrganizationList();

  if (!orgs || orgs.length === 0) {
    console.log('No organizations found');
    return;
  }

  const org = orgs[0];
  console.log(`Syncing users for organization: ${org.name}`);

  // Get all members of the organization
  const memberList = await clerk.organizations.getOrganizationMembershipList({
    organizationId: org.id,
  });

  console.log(`Found ${memberList.data.length} members`);

  // Get the organization UUID from Supabase
  const { data: supabaseOrg } = await supabase
    .from('organizations')
    .select('id')
    .eq('clerk_org_id', org.id)
    .single();

  if (!supabaseOrg) {
    console.error('Organization not found in Supabase. Run sync-org.ts first.');
    return;
  }

  for (const membership of memberList.data) {
    const user = await clerk.users.getUser(membership.publicUserData.userId);

    console.log(`Syncing user: ${user.emailAddresses[0]?.emailAddress} (${user.id})`);

    // Upsert user
    const { error: userError } = await supabase
      .from('users')
      .upsert({
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress || '',
        first_name: user.firstName,
        last_name: user.lastName,
        avatar_url: user.imageUrl,
      }, {
        onConflict: 'id'
      });

    if (userError) {
      console.error('Error syncing user:', userError);
      continue;
    }

    // Upsert organization membership
    const { error: memberError } = await supabase
      .from('org_members')
      .upsert({
        org_id: supabaseOrg.id,
        user_id: user.id,
        role: membership.role,
      }, {
        onConflict: 'org_id,user_id'
      });

    if (memberError) {
      console.error('Error syncing membership:', memberError);
    } else {
      console.log(`✓ Synced: ${user.emailAddresses[0]?.emailAddress}`);
    }
  }

  console.log('Done!');
}

syncUsers().catch(console.error);
