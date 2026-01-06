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

async function syncOrganization() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const clerk = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY!,
  });

  // Get all organizations
  const { data: orgs } = await clerk.organizations.getOrganizationList();

  console.log('Found organizations:', orgs);

  for (const org of orgs) {
    console.log(`Syncing organization: ${org.name} (${org.id})`);

    // Insert or update organization
    const { error } = await supabase
      .from('organizations')
      .upsert({
        clerk_org_id: org.id,
        name: org.name,
        slug: org.slug || org.name.toLowerCase().replace(/\s+/g, '-'),
      }, {
        onConflict: 'clerk_org_id'
      });

    if (error) {
      console.error('Error syncing org:', error);
    } else {
      console.log(`✓ Synced: ${org.name}`);
    }
  }

  console.log('Done!');
}

syncOrganization().catch(console.error);
