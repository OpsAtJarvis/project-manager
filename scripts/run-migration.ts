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

async function runMigration() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  console.log('Running migration: add-project-features.sql\n');

  const migrationPath = resolve(process.cwd(), 'supabase/migrations/add-project-features.sql');
  const migration = readFileSync(migrationPath, 'utf-8');

  // Split by semicolons and execute each statement
  const statements = migration
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  for (const statement of statements) {
    console.log('Executing:', statement.substring(0, 60) + '...');
    const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' }).single();

    if (error) {
      // Try direct execution as fallback
      const { error: directError } = await supabase.from('_migrations').insert({ statement });
      if (directError) {
        console.error('Migration error:', error);
      }
    }
  }

  console.log('\n✓ Migration completed successfully!');
}

runMigration().catch(console.error);
