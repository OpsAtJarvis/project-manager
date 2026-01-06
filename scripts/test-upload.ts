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

async function testUpload() {
  console.log('Testing Supabase storage upload...\n');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const BUCKET_NAME = 'project-documents';

  // List buckets to verify connection
  console.log('1. Checking bucket access...');
  const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();

  if (bucketError) {
    console.error('Error listing buckets:', bucketError);
    return;
  }

  console.log('   Buckets found:', buckets?.map(b => b.name));

  const bucket = buckets?.find(b => b.name === BUCKET_NAME);
  if (!bucket) {
    console.error(`   Bucket "${BUCKET_NAME}" not found!`);
    return;
  }
  console.log(`   Bucket "${BUCKET_NAME}" exists ✓`);

  // Check bucket settings
  console.log('\n2. Bucket settings:');
  console.log('   Public:', bucket.public);
  console.log('   File size limit:', bucket.file_size_limit);
  console.log('   Allowed MIME types:', bucket.allowed_mime_types);

  // Try to upload a test file
  console.log('\n3. Testing upload with a simple text file...');
  const testContent = new Blob(['Test content'], { type: 'text/plain' });
  const testPath = `test/test-${Date.now()}.txt`;

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(testPath, testContent, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) {
    console.error('   Upload error:', uploadError);

    // Check if it's a MIME type restriction
    if (uploadError.message.includes('mime') || uploadError.message.includes('type')) {
      console.log('\n   The bucket only allows PDF files. Let me test with a PDF...');

      // Create a minimal PDF content
      const pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>
endobj
xref
0 4
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
trailer
<< /Size 4 /Root 1 0 R >>
startxref
196
%%EOF`;

      const pdfBlob = new Blob([pdfContent], { type: 'application/pdf' });
      const pdfPath = `test/test-${Date.now()}.pdf`;

      const { data: pdfData, error: pdfError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(pdfPath, pdfBlob, {
          cacheControl: '3600',
          upsert: false,
          contentType: 'application/pdf',
        });

      if (pdfError) {
        console.error('   PDF upload error:', pdfError);
      } else {
        console.log('   PDF upload successful! ✓');
        console.log('   Path:', pdfData?.path);

        // Clean up
        await supabase.storage.from(BUCKET_NAME).remove([pdfPath]);
        console.log('   Test file cleaned up');
      }
    }
  } else {
    console.log('   Upload successful! ✓');
    console.log('   Path:', uploadData?.path);

    // Clean up
    await supabase.storage.from(BUCKET_NAME).remove([testPath]);
    console.log('   Test file cleaned up');
  }

  console.log('\n4. Checking projects table for a valid project ID...');
  const { data: projects, error: projError } = await supabase
    .from('projects')
    .select('id, name')
    .limit(1);

  if (projError) {
    console.error('   Error fetching projects:', projError);
  } else if (projects && projects.length > 0) {
    console.log('   Found project:', projects[0].name, '(ID:', projects[0].id + ')');
  } else {
    console.log('   No projects found in database');
  }

  console.log('\nDone!');
}

testUpload().catch(console.error);
