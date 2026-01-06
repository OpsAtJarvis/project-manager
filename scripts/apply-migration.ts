import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load environment variables
const envPath = resolve(process.cwd(), '.env.local');
const envFile = readFileSync(envPath, 'utf-8');
envFile.split('\n').forEach(line => {
  const trimmedLine = line.trim();
  if (!trimmedLine || trimmedLine.startsWith('#')) return;
  const match = trimmedLine.match(/^([^=]+)=(.*)$/);
  if (match) {
    process.env[match[1].trim()] = match[2].trim();
  }
});

async function applyMigration() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  console.log('Applying database migration...\n');

  // Step 1: Add columns to projects table
  console.log('1. Adding columns to projects table...');
  const { error: alterError } = await supabase.rpc('exec', {
    query: `
      ALTER TABLE projects
      ADD COLUMN IF NOT EXISTS start_date DATE,
      ADD COLUMN IF NOT EXISTS due_date DATE,
      ADD COLUMN IF NOT EXISTS assigned_to TEXT;
    `
  });

  // Since rpc might not work, let's verify by checking if we can query
  const { data: projectTest } = await supabase
    .from('projects')
    .select('id, start_date, due_date, assigned_to')
    .limit(1);

  if (!projectTest) {
    console.log('   ⚠️  Need to run migration in Supabase SQL Editor');
    console.log('   Copy the SQL from: supabase/migrations/add-project-features.sql');
    console.log('   And run it in: https://supabase.com/dashboard/project/hqesetadafkqjisycuww/sql');
  } else {
    console.log('   ✓ Projects table updated');
  }

  // Step 2: Create project_notes table
  console.log('\n2. Creating project_notes table...');
  const { data: notesTest } = await supabase
    .from('project_notes')
    .select('id')
    .limit(1);

  if (!notesTest) {
    console.log('   ⚠️  Need to create project_notes table in Supabase SQL Editor');
  } else {
    console.log('   ✓ project_notes table exists');
  }

  console.log('\n📋 Next steps:');
  console.log('   1. Go to: https://supabase.com/dashboard/project/hqesetadafkqjisycuww/sql');
  console.log('   2. Copy SQL from: supabase/migrations/add-project-features.sql');
  console.log('   3. Run the SQL');
  console.log('   4. Come back and continue');
}

applyMigration().catch(console.error);
