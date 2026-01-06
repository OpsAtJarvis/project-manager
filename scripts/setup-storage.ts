import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load environment variables from .env.local
const envPath = resolve(process.cwd(), '.env.local');
const envFile = readFileSync(envPath, 'utf-8');
envFile.split('\n').forEach(line => {
  const trimmedLine = line.trim();
  if (!trimmedLine || trimmedLine.startsWith('#')) return;

  const match = trimmedLine.match(/^([^=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    const value = match[2].trim();
    process.env[key] = value;
  }
});

async function setupStorage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const BUCKET_NAME = 'project-documents';

  // Check if bucket exists
  const { data: buckets } = await supabase.storage.listBuckets();
  const bucketExists = buckets?.some(b => b.name === BUCKET_NAME);

  if (bucketExists) {
    console.log(`Bucket "${BUCKET_NAME}" already exists`);
  } else {
    // Create the bucket
    const { data, error } = await supabase.storage.createBucket(BUCKET_NAME, {
      public: false,
      fileSizeLimit: 10485760, // 10MB
      allowedMimeTypes: ['application/pdf'],
    });

    if (error) {
      console.error('Error creating bucket:', error);
      return;
    }

    console.log(`Created bucket: ${BUCKET_NAME}`);
  }

  console.log('Storage setup complete!');
}

setupStorage().catch(console.error);
