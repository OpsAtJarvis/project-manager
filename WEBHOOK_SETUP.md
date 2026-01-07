# Clerk Webhook Setup Guide

## Why You Need This
The Clerk webhook syncs user and organization data from Clerk (authentication) to Supabase (database). Without it, new users won't be able to create projects.

## Setup Steps

### 1. Get Your Webhook URL
Your production webhook endpoint is:
```
https://project-manager-three-alpha.vercel.app/api/webhooks/clerk
```

### 2. Create Webhook Secret in Clerk

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Navigate to **Webhooks** in the left sidebar
4. Click **+ Add Endpoint**
5. Enter your webhook URL:
   ```
   https://project-manager-three-alpha.vercel.app/api/webhooks/clerk
   ```

### 3. Subscribe to Events

Select these events:
- ✅ `user.created`
- ✅ `user.updated`
- ✅ `organization.created`
- ✅ `organization.updated`
- ✅ `organizationMembership.created`
- ✅ `organizationMembership.deleted`

### 4. Get Signing Secret

After creating the endpoint, Clerk will show you a **Signing Secret** (starts with `whsec_`).

**Copy this secret!**

### 5. Add Secret to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to your project: **tanmaay-ks-projects/project-manager**
3. Go to **Settings** → **Environment Variables**
4. Add a new variable:
   - **Name:** `CLERK_WEBHOOK_SECRET`
   - **Value:** `whsec_...` (the secret you copied)
   - **Environment:** Production (and Preview if you want)
5. Click **Save**

### 6. Redeploy

After adding the environment variable:
1. Go to **Deployments** tab
2. Click on the latest deployment
3. Click **⋯** (three dots) → **Redeploy**
4. OR just push a new commit (webhook will work on next deployment)

## Testing the Webhook

### Test in Clerk Dashboard
1. In Clerk Dashboard → Webhooks → Your endpoint
2. Click **Testing** tab
3. Send a test `user.created` event
4. Check that it shows **200 OK** response

### Test in Your App
1. Create a new user account in your production app
2. Go to Supabase Dashboard → Table Editor → `users` table
3. Verify the new user appears there
4. Try creating a project - it should work!

## Troubleshooting

### Webhook Returns 500 Error
- Check Vercel logs: Deployment → Functions → `/api/webhooks/clerk`
- Make sure `CLERK_WEBHOOK_SECRET` is set correctly

### User Not Appearing in Supabase
- Verify webhook is receiving events (check Clerk Dashboard → Webhooks → Logs)
- Check Supabase logs for errors
- Ensure your Supabase `SUPABASE_SERVICE_ROLE_KEY` is set in Vercel

### Projects Fail to Create
- Run this SQL in Supabase to manually add your user:
  ```sql
  INSERT INTO users (id, email, first_name, last_name, avatar_url)
  VALUES (
    'your_clerk_user_id',  -- Get from Clerk Dashboard
    'your@email.com',
    'Your',
    'Name',
    'https://img.clerk.com/...'  -- Your avatar URL
  )
  ON CONFLICT (id) DO NOTHING;
  ```

## Current Status

✅ Webhook endpoint created: `/app/api/webhooks/clerk/route.ts`
❌ **Not configured in Clerk Dashboard yet**
❌ **CLERK_WEBHOOK_SECRET not set in Vercel**

**Next Step:** Follow steps 2-6 above to complete the setup!
