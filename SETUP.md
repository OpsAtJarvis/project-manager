# Project Manager Setup Guide

This guide will help you set up your Next.js 15 + Clerk + Supabase project management application.

## Prerequisites

- Node.js 18+ installed
- A Clerk account (https://clerk.com)
- A Supabase account (https://supabase.com)

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Clerk

1. Go to https://clerk.com and create a new application
2. Enable "Organizations" in your Clerk dashboard under Configure > Organizations
3. Create a JWT Template for Supabase:
   - Go to Configure > JWT Templates
   - Click "New template"
   - Choose "Supabase" from the templates
   - Name it "supabase"
   - Save the template
4. Set up a webhook endpoint:
   - Go to Configure > Webhooks
   - Add endpoint: `https://your-domain.com/api/webhooks/clerk`
   - Subscribe to events: `user.created`, `user.updated`, `organization.created`, `organization.updated`, `organizationMembership.created`, `organizationMembership.deleted`
   - Copy the signing secret (starts with `whsec_`)

## Step 3: Set Up Supabase

1. Create a new project at https://supabase.com
2. Go to Project Settings > API to get your:
   - Project URL (NEXT_PUBLIC_SUPABASE_URL)
   - Anon/Public Key (NEXT_PUBLIC_SUPABASE_ANON_KEY)
   - Service Role Key (SUPABASE_SERVICE_ROLE_KEY) - Keep this secret!

3. Run the database schema:
   - Go to SQL Editor in Supabase
   - Copy the contents of `supabase/schema.sql`
   - Run the SQL

4. Enable Row Level Security policies:
   - In SQL Editor, copy the contents of `supabase/rls-policies.sql`
   - Run the SQL

5. Configure Supabase to work with Clerk:
   - Go to Authentication > Providers
   - Disable all default providers
   - We'll use Clerk's JWT for authentication

6. Update Supabase JWT Secret:
   - Get your Clerk JWT Issuer URL from Clerk Dashboard > Configure > JWT Templates > Your Template
   - Go to Supabase Dashboard > Settings > API
   - Update JWT Secret with your Clerk's JWKS endpoint

## Step 4: Configure Environment Variables

1. Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

2. Fill in all the environment variables:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Step 5: Run the Development Server

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## Step 6: Test the Application

1. Sign up for a new account
2. Create an organization
3. Create a project
4. Upload documents (PDF files)
5. Invite team members
6. Manage document statuses

## Features

- **Authentication**: Secure authentication with Clerk
- **Multi-tenancy**: Organization-based access control
- **Projects**: Create and manage projects
- **Documents**: Upload and manage PDF documents
- **Members**: Add and remove project members
- **RLS Security**: Row-level security policies in Supabase
- **Real-time Updates**: Automatic revalidation of data

## Project Structure

```
project-manager/
├── app/
│   ├── (auth)/              # Authentication pages
│   ├── (dashboard)/         # Dashboard pages
│   └── api/                 # API routes
├── components/
│   ├── ui/                  # Reusable UI components
│   ├── projects/            # Project components
│   ├── documents/           # Document components
│   ├── members/             # Member components
│   └── layout/              # Layout components
├── lib/
│   ├── actions/             # Server actions
│   └── supabase/            # Supabase clients
├── supabase/                # Database schema and policies
└── types/                   # TypeScript types
```

## Troubleshooting

### Webhook Issues

If webhooks aren't working:
1. Make sure your webhook endpoint is publicly accessible
2. Check that you've subscribed to the correct events
3. Verify the webhook secret is correct

### Database Issues

If you get permission errors:
1. Make sure RLS policies are enabled
2. Check that your JWT template is configured correctly
3. Verify user IDs match between Clerk and Supabase

### Storage Issues

If file uploads fail:
1. Check that the `project-documents` bucket exists in Supabase Storage
2. Verify storage policies are set up correctly
3. Check file size limits (max 10MB for PDFs)

## Security Notes

- Never commit `.env.local` to version control
- Keep your Service Role Key secret
- Use environment variables for all sensitive data
- Review RLS policies before going to production
- Enable SSL in production

## Next Steps

- Customize the UI with your branding
- Add more document types
- Implement email notifications
- Add project analytics
- Set up production deployment

## Support

For issues or questions:
- Check the documentation
- Review the code comments
- Test with sample data first
