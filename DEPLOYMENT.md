# Deployment Guide

## Option 1: Deploy via Vercel Dashboard (Recommended)

### Step 1: Push to GitHub (Optional but Recommended)

```bash
# Create a new GitHub repository
gh repo create project-manager --public --source=. --push

# Or manually:
# 1. Go to https://github.com/new
# 2. Create a repository named "project-manager"
# 3. Run these commands:
git remote add origin https://github.com/YOUR_USERNAME/project-manager.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy on Vercel

1. Go to https://vercel.com/new
2. Import your GitHub repository (or upload the project folder)
3. Configure the project:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)

### Step 3: Add Environment Variables

Click "Environment Variables" and add these:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_c3VwZXJiLW1hcnRlbi03Ni5jbGVyay5hY2NvdW50cy5kZXYk
CLERK_SECRET_KEY=sk_test_l1sNsJmnSSgB40xOLfLYmPuO0xXparhi2XKq3nVuik
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
NEXT_PUBLIC_SUPABASE_URL=https://hqesetadafkqjisycuww.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxZXNldGFkYWZrcWppc3ljdXd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2MTE4MTQsImV4cCI6MjA4MzE4NzgxNH0.mPqnFdQ9ReA2tyEpol7hSBCYZtEuEBFZ3QErh6p9kFk
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxZXNldGFkYWZrcWppc3ljdXd3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzYxMTgxNCwiZXhwIjoyMDgzMTg3ODE0fQ.C5SCSNsfCHH4LCQUMDE7ESOgoTh-R-geqS4jKoz7DTc
```

**Important:** Make sure to set these for **All Environments** (Production, Preview, Development)

### Step 4: Deploy

Click "Deploy" and wait for the build to complete (2-3 minutes)

### Step 5: Update Clerk Settings

Once deployed, you'll get a URL like `https://project-manager-xyz.vercel.app`

1. Go to Clerk Dashboard: https://dashboard.clerk.com
2. Navigate to your application
3. Go to "Domains" section
4. Add your Vercel domain: `project-manager-xyz.vercel.app`
5. Update allowed redirect URLs to include your production domain

### Step 6: Set Up Clerk Webhook (Important!)

This enables automatic user/org syncing:

1. In Clerk Dashboard, go to "Webhooks"
2. Click "Add Endpoint"
3. Endpoint URL: `https://your-app.vercel.app/api/webhooks/clerk`
4. Subscribe to these events:
   - `user.created`
   - `user.updated`
   - `organization.created`
   - `organization.updated`
5. Copy the "Signing Secret"
6. Add to Vercel environment variables:
   ```
   CLERK_WEBHOOK_SECRET=whsec_your_actual_secret
   ```
7. Redeploy the application

## Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Follow prompts and add environment variables when asked
# Then deploy to production:
vercel --prod
```

## Post-Deployment Checklist

- [ ] Application is live and accessible
- [ ] Can sign in with Clerk
- [ ] Can create projects with dates and assignments
- [ ] Can upload PDFs
- [ ] Can add notes
- [ ] Webhook is configured and working
- [ ] New users are automatically synced to Supabase

## Troubleshooting

### Build Errors

If build fails with module errors:
```bash
# Ensure all dependencies are in package.json
npm install
git add package-lock.json
git commit -m "Update dependencies"
git push
```

### Environment Variables Not Working

- Make sure they're set for all environments
- Check for typos in variable names
- Redeploy after adding new variables

### Webhook Not Working

- Verify the endpoint URL is correct
- Check the signing secret matches
- Look at Vercel logs for errors
- Test webhook manually in Clerk dashboard

## Custom Domain (Optional)

1. Go to Vercel project settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Update Clerk domain settings to include custom domain

## Monitoring

- Check Vercel Analytics for traffic
- Monitor Clerk Dashboard for user activity
- Check Supabase Dashboard for database usage
- Review Vercel Logs for any errors
