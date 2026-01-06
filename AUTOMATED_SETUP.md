# Automated Setup Guide

## Issue: NPM Permission Error

Your system has npm cache permission issues. Fix this first:

```bash
# Fix npm permissions (run this in Terminal)
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /Users/max/.npm

# Then install dependencies
cd /Users/max/Downloads/project-manager
npm install
```

## Quick Setup (5 minutes total)

### Step 1: Create Clerk Account (2 min)

1. Open https://clerk.com in browser
2. Sign up / Sign in
3. Click "Create Application"
   - Name: "Project Manager"
   - Select sign-in options: Email, Google (optional)
   - Click "Create Application"
4. Enable Organizations:
   - Go to "Organizations" in sidebar
   - Toggle "Enable Organizations"
5. Copy API Keys:
   - You'll see: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`
   - Keep this tab open

### Step 2: Create Supabase Project (2 min)

1. Open https://supabase.com in browser
2. Sign up / Sign in
3. Click "New Project"
   - Name: "project-manager"
   - Database Password: (generate strong password - save it!)
   - Region: Choose closest to you
   - Click "Create new project" (takes ~2 min to provision)
4. While waiting, copy these from Settings > API:
   - `Project URL` (NEXT_PUBLIC_SUPABASE_URL)
   - `anon public` key (NEXT_PUBLIC_SUPABASE_ANON_KEY)
   - `service_role` key (SUPABASE_SERVICE_ROLE_KEY)

### Step 3: Configure Environment Variables

```bash
# Copy example file
cp .env.example .env.local

# Edit .env.local with your favorite editor
# Paste the keys from Clerk and Supabase
```

Your `.env.local` should look like:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx
CLERK_WEBHOOK_SECRET=whsec_xxx  # (we'll add this later)

NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

### Step 4: Set Up Database Schema

1. Go to Supabase Dashboard > SQL Editor
2. Click "New query"
3. Copy entire contents of `supabase/schema.sql`
4. Paste and click "Run"
5. Create new query
6. Copy entire contents of `supabase/rls-policies.sql`
7. Paste and click "Run"

### Step 5: Configure Clerk JWT Template

1. In Clerk Dashboard, go to "JWT Templates"
2. Click "New template"
3. Select "Supabase"
4. Name it: "supabase"
5. In the template, use this:

```json
{
  "aud": "authenticated",
  "exp": {{exp}},
  "iat": {{iat}},
  "iss": "{{iss}}",
  "sub": "{{user.id}}",
  "email": "{{user.primary_email_address}}",
  "role": "authenticated",
  "user_metadata": {
    "email": "{{user.primary_email_address}}",
    "email_verified": {{user.primary_email_address_verified}},
    "full_name": "{{user.full_name}}",
    "avatar_url": "{{user.image_url}}"
  }
}
```

6. Save the template

### Step 6: Test Locally

```bash
npm run dev
```

Open http://localhost:3000 - you should see the landing page!

### Step 7: Deploy to Vercel

#### Option A: Using Vercel CLI (Easiest)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
cd /Users/max/Downloads/project-manager
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? (your account)
# - Link to existing project? No
# - Project name? project-manager
# - Directory? ./
# - Override settings? No

# Add environment variables
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
vercel env add CLERK_SECRET_KEY
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY

# Deploy to production
vercel --prod
```

#### Option B: Using Vercel Dashboard

1. Go to https://vercel.com
2. Click "Add New" > "Project"
3. Import from Git:
   - First push to GitHub (see Step 8)
   - Select your repo
4. Configure:
   - Framework: Next.js
   - Root Directory: ./
5. Add Environment Variables (copy from .env.local)
6. Click "Deploy"

### Step 8: Push to GitHub (if using Option B)

```bash
cd /Users/max/Downloads/project-manager
git init
git add .
git commit -m "Initial commit: Project Manager app"

# Create repo on GitHub and push
gh repo create project-manager --public --source=. --remote=origin --push
```

### Step 9: Configure Clerk Webhook

1. Get your Vercel deployment URL (e.g., https://project-manager-xyz.vercel.app)
2. In Clerk Dashboard > Webhooks
3. Click "Add Endpoint"
4. Endpoint URL: `https://your-app.vercel.app/api/webhooks/clerk`
5. Subscribe to events:
   - `user.created`
   - `user.updated`
   - `organization.created`
   - `organization.updated`
6. Copy the "Signing Secret"
7. Add to Vercel environment variables:
   ```bash
   vercel env add CLERK_WEBHOOK_SECRET
   # Paste the signing secret
   ```
8. Redeploy:
   ```bash
   vercel --prod
   ```

## You're Done! 🎉

Your app is now live at: `https://your-app.vercel.app`

## Quick Test Checklist

- [ ] Can access landing page
- [ ] Can sign up for account
- [ ] Can create organization
- [ ] Can create project
- [ ] Can upload PDF document
- [ ] Can assign team members
- [ ] Can update document status

## Troubleshooting

**"Clerk is not defined" error:**
- Make sure you added all environment variables
- Redeploy after adding env vars

**Database errors:**
- Verify schema.sql and rls-policies.sql ran successfully
- Check Supabase logs

**File upload errors:**
- Verify storage bucket was created (check schema.sql)
- Check RLS policies on storage

Need help? Check SETUP.md for detailed troubleshooting.
