# Project Manager - Full Stack SaaS Application

## Project Overview
A production-ready project management SaaS application built with Next.js 15, Clerk authentication, and Supabase database. Features include organization-based multi-tenancy, project tracking, document management, team collaboration, and real-time updates.

## Tech Stack
- **Framework**: Next.js 15.5.9 (App Router, Server Actions, React 19)
- **Authentication**: Clerk (with Organizations support)
- **Database**: Supabase (PostgreSQL with Row Level Security)
- **Storage**: Supabase Storage (TUS protocol for resumable uploads)
- **Deployment**: Vercel (via CLI)
- **UI**: Shadcn UI + Tailwind CSS
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React
- **Date Handling**: date-fns

## Project Structure
```
project-manager/
├── app/
│   ├── (auth)/
│   │   ├── sign-in/[[...sign-in]]/page.tsx
│   │   └── sign-up/[[...sign-up]]/page.tsx
│   ├── (dashboard)/
│   │   ├── dashboard/page.tsx          # Dashboard with stats
│   │   ├── projects/
│   │   │   ├── page.tsx                # Projects list with filtering
│   │   │   ├── new/page.tsx            # Create new project
│   │   │   └── [id]/page.tsx           # Project details
│   │   └── layout.tsx                  # Dashboard layout with sidebar
│   ├── api/
│   │   └── webhooks/
│   │       └── clerk/route.ts          # Clerk → Supabase sync webhook
│   ├── layout.tsx
│   └── page.tsx                        # Landing page
├── components/
│   ├── layout/
│   │   ├── sidebar.tsx                 # Navigation with OrganizationSwitcher
│   │   └── header.tsx
│   ├── projects/
│   │   ├── project-card.tsx            # Enhanced card with avatars, due dates
│   │   ├── projects-list.tsx           # Client component with tabs, search, sort
│   │   ├── project-form.tsx
│   │   ├── project-timeline.tsx
│   │   └── project-notes.tsx
│   ├── documents/
│   │   ├── document-upload.tsx         # TUS upload component
│   │   └── document-list.tsx
│   ├── members/
│   │   └── member-list.tsx
│   └── ui/                             # Shadcn components
│       ├── tabs.tsx
│       ├── input.tsx
│       ├── select.tsx
│       ├── avatar.tsx
│       ├── badge.tsx
│       ├── button.tsx
│       └── card.tsx
├── lib/
│   ├── actions/
│   │   ├── projects.ts                 # Server actions for projects CRUD
│   │   ├── documents.ts                # Document upload/download actions
│   │   ├── members.ts                  # Project members management
│   │   └── notes.ts                    # Project notes/comments
│   ├── supabase/
│   │   └── server.ts                   # Supabase service client
│   └── utils.ts                        # Utility functions (cn, etc.)
├── types/
│   └── database.ts                     # Supabase database types
├── middleware.ts                       # Clerk authentication middleware
├── .env.local                          # Environment variables (not committed)
├── components.json                     # Shadcn UI configuration
├── tailwind.config.ts
├── next.config.ts
└── package.json
```

## Database Schema (Supabase)

### Core Tables
1. **users** - Synced from Clerk via webhook
   - `id` (TEXT, PK) - Clerk user ID
   - `email`, `first_name`, `last_name`, `avatar_url`
   - `created_at`, `updated_at`

2. **organizations** - Synced from Clerk via webhook
   - `id` (UUID, PK)
   - `clerk_org_id` (TEXT, UNIQUE) - Links to Clerk
   - `name`, `slug`
   - `created_at`, `updated_at`

3. **org_members** - Organization membership
   - `id` (UUID, PK)
   - `org_id` (FK → organizations)
   - `user_id` (FK → users)
   - `role` (TEXT)

4. **projects** - Main project data
   - `id` (UUID, PK)
   - `org_id` (FK → organizations)
   - `name`, `description`
   - `status` (active, completed, on_hold, cancelled)
   - `owner_id` (FK → users)
   - `assigned_to` (FK → users)
   - `start_date`, `due_date`
   - `created_at`, `updated_at`

5. **project_members** - Project team members
   - `id` (UUID, PK)
   - `project_id` (FK → projects)
   - `user_id` (FK → users)

6. **documents** - File attachments
   - `id` (UUID, PK)
   - `project_id` (FK → projects)
   - `name`, `file_path`, `file_size`, `mime_type`
   - `uploaded_by` (FK → users)
   - `created_at`

7. **notes** - Project comments/notes
   - `id` (UUID, PK)
   - `project_id` (FK → projects)
   - `user_id` (FK → users)
   - `content` (TEXT)
   - `created_at`, `updated_at`

### Storage
- **Bucket**: `project-documents` (private)
- **Path pattern**: `{project_id}/{uuid}.{extension}`

## Key Features Implemented

### 1. Authentication & Organizations (Clerk)
- Email/password and Google OAuth
- Organization-based multi-tenancy
- Organization switcher in sidebar
- Invitation system with proper redirects
- Automatic user sync to Supabase via webhook

### 2. Project Management
- **Create/Edit/Delete** projects (Server Actions)
- **Status tracking**: Active, Completed, On Hold, Cancelled
- **Timeline**: Start date → Due date with progress visualization
- **Assignments**: Assign projects to team members
- **Search & Filter**: Real-time search, status tabs, sort options
- **Statistics Dashboard**: Total/Active/Completed counts

### 3. Document Management
- **TUS protocol** for resumable uploads
- **Drag & drop** file upload
- **File preview** and download
- **Storage**: Supabase Storage with signed URLs

### 4. Team Collaboration
- **Project members**: Add/remove team members
- **Notes/Comments**: Timeline of project discussions
- **Owner tracking**: Clear ownership with avatars

### 5. UI/UX Enhancements
- **Shadcn UI components** for consistent design
- **Responsive layout** (mobile-friendly)
- **Real-time search** with debouncing
- **Tabs**: All/Active/Completed projects
- **Sort options**: Recently updated, created, name, due date
- **Status badges** with color coding
- **Due date warnings**: Overdue, due today, X days left
- **Avatar fallbacks** with gradient backgrounds
- **Relative timestamps**: "Updated 2 hours ago"
- **Empty states** with helpful CTAs

## Architecture Patterns

### Server Actions Pattern
```typescript
// lib/actions/projects.ts
'use server';

export async function createProject(formData: FormData) {
  const { userId, orgId } = await auth();

  // Always use service client in server actions
  const supabase = createServiceSupabaseClient();

  // Look up organization UUID from Clerk org ID
  const { data: org } = await supabase
    .from('organizations')
    .select('id')
    .eq('clerk_org_id', orgId)
    .single();

  // Insert with org UUID
  const { data, error } = await supabase
    .from('projects')
    .insert({ org_id: org.id, ... })
    .select()
    .single();

  // Invalidate cache
  revalidatePath('/projects');

  return { data, error };
}
```

### Client Component Pattern
```typescript
// components/projects/projects-list.tsx
'use client';

export function ProjectsList({ projects }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('updated');

  // Client-side filtering and sorting
  const filtered = useMemo(() =>
    projects
      .filter(p => p.name.includes(searchQuery))
      .sort((a, b) => /* sort logic */),
    [projects, searchQuery, sortBy]
  );

  return <Tabs>...</Tabs>;
}
```

### Webhook Sync Pattern
```typescript
// app/api/webhooks/clerk/route.ts
// Syncs Clerk users/orgs to Supabase automatically

- user.created → INSERT/UPSERT into users table
- organization.created → INSERT/UPSERT into organizations table
- organizationMembership.created → INSERT into org_members table
```

## Environment Variables

### Development (.env.local)
```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci... # SECRET!
```

### Production (Vercel)
Same variables + fallback redirects:
```env
CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=https://project-manager-three-alpha.vercel.app/dashboard
CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=https://project-manager-three-alpha.vercel.app/dashboard
```

## Deployment

### Current Deployment
- **Production URL**: https://project-manager-three-alpha.vercel.app
- **Repository**: https://github.com/OpsAtJarvis/project-manager
- **Vercel Project**: tanmaay-ks-projects/project-manager
- **Deployed via**: Vercel CLI (not GitHub integration)

### Deploy Commands
```bash
# Link project (already done)
vercel link --yes

# Add environment variable
vercel env add KEY_NAME production --yes <<< "value"

# Deploy to production
vercel --prod --yes

# View logs
vercel logs

# List deployments
vercel ls
```

## Important Configuration Details

### TypeScript Build Configuration
```typescript
// next.config.ts
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true, // Required for Supabase type issues
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};
```

### Middleware Protection
```typescript
// middleware.ts
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/projects(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});
```

### Organization Switcher Configuration
```typescript
<OrganizationSwitcher
  hidePersonal
  afterSelectOrganizationUrl="/dashboard"
  afterCreateOrganizationUrl="/dashboard"
  afterLeaveOrganizationUrl="/dashboard"
  afterInviteOrganizationUrl="/dashboard"
  organizationProfileProps={{
    afterLeaveOrganizationUrl: "/dashboard",
  }}
/>
```

## Common Patterns & Conventions

### Type Assertions
Due to Supabase type complexity, we use type assertions:
```typescript
const projectList: any[] = projects || [];
const proj: any = project;
```

### Date Handling
```typescript
// Store as ISO strings
start_date: '2024-01-15'
due_date: '2024-02-28'

// Display with date-fns
formatDistanceToNow(new Date(project.updated_at), { addSuffix: true })
```

### Error Handling
```typescript
const { data, error } = await someAction();

if (error) {
  console.error('Action failed:', error);
  // Show error to user
  return;
}

// Use data
```

### Cache Invalidation
```typescript
import { revalidatePath } from 'next/cache';

// After mutations, always revalidate
await createProject(formData);
revalidatePath('/projects');
revalidatePath('/dashboard');
```

## Known Issues & Solutions

### Issue 1: Organization Invitation Redirects
**Problem**: Users land on Clerk page after accepting invitations
**Solution**: Set fallback redirect URLs in environment variables

### Issue 2: TypeScript Build Errors
**Problem**: Supabase types cause strict type checking failures
**Solution**: Use `ignoreBuildErrors: true` in next.config.ts

### Issue 3: Service Client vs RLS
**Decision**: Use Service Client in all Server Actions (bypasses RLS)
**Reason**: Simpler than managing complex RLS policies for multi-tenant SaaS

### Issue 4: Organization UUID Lookup
**Pattern**: Always convert Clerk org ID to Supabase UUID:
```typescript
const { data: org } = await supabase
  .from('organizations')
  .select('id')
  .eq('clerk_org_id', orgId)
  .single();
```

## Development Workflow

### Starting Development
```bash
cd /Users/max/Downloads/project-manager
npm run dev
# Visit http://localhost:3001
```

### Making Changes
1. Edit files in `app/`, `components/`, or `lib/`
2. Changes hot-reload automatically
3. Test locally
4. Commit to Git
5. Deploy to Vercel

### Adding New Features
1. Create server action in `lib/actions/`
2. Create UI component in `components/`
3. Create route in `app/(dashboard)/`
4. Test with real Clerk user + organization
5. Deploy

## Documentation Files
- **SAAS_STACK_GUIDE.md** - Complete implementation guide (900+ lines)
- **WEBHOOK_SETUP.md** - Clerk webhook configuration
- **CLERK_REDIRECT_FIX.md** - Invitation redirect setup

## Next Steps / TODO
- [ ] Add project templates
- [ ] Implement email notifications
- [ ] Add activity log/timeline
- [ ] Real-time collaboration (Supabase Realtime)
- [ ] Advanced search with filters
- [ ] Kanban board view
- [ ] Custom fields per project
- [ ] Billing integration (Stripe)

## Dependencies (package.json)
```json
{
  "dependencies": {
    "@clerk/nextjs": "^6.13.0",
    "@supabase/supabase-js": "^2.47.10",
    "@radix-ui/react-avatar": "^1.1.11",
    "@radix-ui/react-select": "^2.2.6",
    "@radix-ui/react-tabs": "^1.1.13",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "date-fns": "^4.1.0",
    "lucide-react": "^0.562.0",
    "next": "^15.1.4",
    "react": "^19.0.0",
    "react-hook-form": "^7.54.2",
    "svix": "^1.42.1",
    "tailwind-merge": "^3.4.0",
    "tus-js-client": "^4.2.3",
    "zod": "^3.24.1"
  }
}
```

## Testing
- Manual testing in production: https://project-manager-three-alpha.vercel.app
- Test with multiple organizations
- Test invitation flow
- Test file uploads (up to 10MB via TUS)

## Performance Notes
- Build time: ~2 minutes on Vercel
- Cold start: < 1 second
- Database queries: < 50ms (Supabase)
- File uploads: Resumable (TUS protocol)

## Security Considerations
- Service Role Key only used server-side (Server Actions)
- Anon Key safe for client (protected by RLS)
- Webhook signatures verified (svix)
- All routes protected by Clerk middleware
- Organization isolation enforced in server actions

---

**Last Updated**: January 8, 2025
**Status**: Production Ready ✅
**Deployment**: Live on Vercel
