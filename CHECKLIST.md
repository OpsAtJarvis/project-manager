# Setup Checklist

Use this checklist to ensure you've completed all setup steps correctly.

## Prerequisites
- [ ] Node.js 18+ installed
- [ ] npm or yarn installed
- [ ] Clerk account created
- [ ] Supabase account created

## 1. Clerk Setup
- [ ] Create new Clerk application
- [ ] Enable Organizations in Clerk dashboard
- [ ] Create JWT Template named "supabase"
  - [ ] Template type: Supabase
  - [ ] Save template
- [ ] Copy Publishable Key to `.env.local`
- [ ] Copy Secret Key to `.env.local`
- [ ] Set up webhook endpoint
  - [ ] Add endpoint URL: `https://your-domain.com/api/webhooks/clerk`
  - [ ] Subscribe to events:
    - [ ] `user.created`
    - [ ] `user.updated`
    - [ ] `organization.created`
    - [ ] `organization.updated`
    - [ ] `organizationMembership.created`
    - [ ] `organizationMembership.deleted`
  - [ ] Copy webhook secret to `.env.local`

## 2. Supabase Setup
- [ ] Create new Supabase project
- [ ] Copy Project URL to `.env.local`
- [ ] Copy Anon/Public Key to `.env.local`
- [ ] Copy Service Role Key to `.env.local` (keep secret!)
- [ ] Run database schema
  - [ ] Open SQL Editor in Supabase
  - [ ] Run `supabase/schema.sql`
  - [ ] Verify tables created (6 tables)
- [ ] Apply RLS policies
  - [ ] Open SQL Editor in Supabase
  - [ ] Run `supabase/rls-policies.sql`
  - [ ] Verify policies applied
- [ ] Configure JWT settings
  - [ ] Get Clerk JWKS URL from JWT Template
  - [ ] Update Supabase JWT settings if needed

## 3. Environment Variables
- [ ] Copy `.env.example` to `.env.local`
- [ ] Fill in all Clerk variables
  - [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
  - [ ] `CLERK_SECRET_KEY`
  - [ ] `CLERK_WEBHOOK_SECRET`
- [ ] Fill in all Supabase variables
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`

## 4. Install Dependencies
- [ ] Run `npm install`
- [ ] Verify no errors during installation
- [ ] Check `package.json` for correct versions

## 5. Development
- [ ] Run `npm run dev`
- [ ] Open http://localhost:3000
- [ ] Verify no build errors
- [ ] Check browser console for errors

## 6. Testing
- [ ] Sign up for new account
  - [ ] Verify user created in Supabase `users` table
- [ ] Create organization
  - [ ] Verify organization created in Supabase `organizations` table
  - [ ] Verify org membership created in `org_members` table
- [ ] Create project
  - [ ] Verify project appears in list
  - [ ] Verify project created in Supabase `projects` table
- [ ] Upload document
  - [ ] Upload PDF file
  - [ ] Verify document appears in list
  - [ ] Verify document in Supabase `documents` table
  - [ ] Verify file in Supabase Storage bucket
- [ ] Change document status
  - [ ] Try changing to "approved"
  - [ ] Verify status updates in real-time
- [ ] Invite team member (if possible)
  - [ ] Add member to organization in Clerk
  - [ ] Verify member appears in Supabase
  - [ ] Add member to project
  - [ ] Verify member can access project

## 7. Webhook Testing
- [ ] Use ngrok or similar for local testing: `ngrok http 3000`
- [ ] Update webhook URL in Clerk dashboard
- [ ] Create test user
- [ ] Check webhook logs in Clerk dashboard
- [ ] Verify data synced to Supabase

## 8. Production Deployment (Optional)
- [ ] Push code to GitHub
- [ ] Deploy to Vercel (or other platform)
- [ ] Add production environment variables
- [ ] Update Clerk webhook URL to production URL
- [ ] Update Clerk allowed origins
- [ ] Test production deployment

## Common Issues

### Webhook not syncing data
- Check webhook URL is correct and accessible
- Verify webhook secret matches `.env.local`
- Check webhook logs in Clerk dashboard
- Ensure service role key is used in webhook handler

### RLS policy errors
- Verify JWT template is set up correctly in Clerk
- Check Supabase logs for policy violations
- Ensure user is logged in with valid session
- Verify organization context is set

### File upload failures
- Check storage bucket exists: `project-documents`
- Verify storage policies are applied
- Check file type (must be PDF)
- Check file size (max 10MB)
- Verify user has access to project

### Database connection errors
- Verify Supabase URL is correct
- Check API keys are valid
- Ensure database is not paused (free tier)
- Check network connectivity

## Security Checklist
- [ ] `.env.local` is in `.gitignore`
- [ ] Service Role Key is only used server-side
- [ ] RLS policies are enabled on all tables
- [ ] Webhook signature verification is working
- [ ] HTTPS is enabled in production
- [ ] CORS is properly configured

## Performance Checklist
- [ ] Images are optimized
- [ ] Queries use proper indexes
- [ ] Unnecessary re-renders are avoided
- [ ] File uploads have size limits
- [ ] Loading states are implemented

## Done!
- [ ] Application is running smoothly
- [ ] All features are working
- [ ] Documentation is complete
- [ ] Ready for development/production

---

If you encounter any issues not covered here, refer to:
- `SETUP.md` for detailed setup instructions
- `README.md` for project overview
- Clerk documentation: https://clerk.com/docs
- Supabase documentation: https://supabase.com/docs
