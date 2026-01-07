# Fix Clerk Organization Invitation Redirect

## The Problem
When users accept an organization invitation from Clerk's email, they're redirected to a Clerk-hosted page instead of your application.

## The Solution
Configure the proper redirect URLs in your Clerk Dashboard.

## Steps to Fix

### 1. Go to Clerk Dashboard Paths Configuration
1. Open [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Navigate to **User & Authentication** → **Email, Phone, Username**
4. Scroll down to **Redirects** section

### 2. Configure Application URLs

Set these URLs:

**Home URL:**
```
https://project-manager-three-alpha.vercel.app
```

**Sign-in URL:**
```
https://project-manager-three-alpha.vercel.app/sign-in
```

**Sign-up URL:**
```
https://project-manager-three-alpha.vercel.app/sign-up
```

**After sign-in URL:**
```
https://project-manager-three-alpha.vercel.app/dashboard
```

**After sign-up URL:**
```
https://project-manager-three-alpha.vercel.app/dashboard
```

### 3. Configure Organization Settings

1. Go to **Organizations** in the left sidebar
2. Click **Settings** tab
3. Ensure these are set:

**Organization profile URL:**
```
https://project-manager-three-alpha.vercel.app/organizations/[slug]
```
(Or leave as default if you don't have a custom org page)

**After leaving organization:**
```
https://project-manager-three-alpha.vercel.app/dashboard
```

### 4. Configure Email & Invitation Settings

1. Still in **Organizations** → **Settings**
2. Scroll to **Invitations** section
3. Enable **Email invitations**
4. Set **Invitation acceptance redirect:**
```
https://project-manager-three-alpha.vercel.app/dashboard
```

### 5. Save and Test

1. Click **Save** on all changes
2. Send a new organization invitation
3. Accept it from the email
4. User should now be redirected to your application's dashboard!

## Additional Configuration (Optional but Recommended)

### Add Allowed Redirect URLs

1. Go to **User & Authentication** → **Email, Phone, Username**
2. Scroll to **Allowed redirect URLs** section
3. Add these URLs:
```
https://project-manager-three-alpha.vercel.app/*
https://project-manager-three-alpha.vercel.app/dashboard
https://project-manager-three-alpha.vercel.app/sign-in
https://project-manager-three-alpha.vercel.app/sign-up
```

This ensures Clerk allows redirects to your application.

## Troubleshooting

### Still showing Clerk page after accepting invitation?
- Clear your browser cache and cookies
- Try in incognito/private mode
- Check that you saved all settings in Clerk Dashboard
- Verify the URLs don't have trailing slashes

### User lands on Clerk page but can't proceed?
- Make sure the **Home URL** is set correctly
- Check that your application URL is accessible
- Ensure Clerk components are properly configured in your app

## What I Already Did (via Vercel CLI)

✅ Added `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard` to Vercel
✅ Added `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard` to Vercel
✅ Configured middleware to protect routes

**Now you just need to update the Clerk Dashboard settings above!**

## Quick Summary

The main fix is in **Clerk Dashboard** → **Organizations** → **Settings** → **Invitations**:
- Set **Invitation acceptance redirect** to: `https://project-manager-three-alpha.vercel.app/dashboard`

That's the key setting for organization invitations! 🎯
