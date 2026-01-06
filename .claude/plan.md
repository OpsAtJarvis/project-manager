# Enhancement Plan: Project Management Features + Deployment

## Current State Analysis

**Existing Database Schema:**
- Projects: name, description, status, owner_id, created_at, updated_at
- Documents: PDF upload with status tracking (draft/pending)
- Members: Basic project membership tracking
- **Missing:** start_date, end_date, assignee, notes/comments

**Existing UI Components:**
- Project creation form (name + description only)
- Document upload/list
- Member list
- Card, Badge, Button components available

## Requested Features

1. **Project Timeline** - Start date and finish date
2. **Assignment** - Person responsible for project
3. **Member Management** - Add people to projects
4. **Notes** - Add notes/comments to projects
5. **Better UI** - Use modern design patterns
6. **Deploy** - Take application live on Vercel

## Implementation Strategy

### Phase 1: Database Schema Updates

**Add to projects table:**
- `start_date DATE`
- `due_date DATE`
- `assigned_to TEXT REFERENCES users(id)` - person responsible

**Create new notes table:**
```sql
CREATE TABLE project_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Why this approach:**
- Minimal schema changes to existing projects table
- Separate notes table for better scalability and query performance
- Leverages existing user/project relationships

### Phase 2: Server Actions

**Update existing actions:**
- `lib/actions/projects.ts` - Add start_date, due_date, assigned_to to create/update

**Create new actions:**
- `lib/actions/notes.ts` - createNote, getNotes, updateNote, deleteNote

**Why this approach:**
- Reuse existing action patterns
- Keep service client pattern for consistency
- Minimal file changes

### Phase 3: UI Components (Token-Efficient Approach)

**Enhanced Project Form:**
- Extend `app/(dashboard)/projects/new/page.tsx`
- Add: start date picker, due date picker, assignee dropdown
- Use native HTML5 date inputs (no external libraries)

**Project Detail Page Enhancements:**
- Add timeline section showing start → due date with progress bar
- Add assignee display with avatar
- Add notes section with add/edit/delete
- Use existing Card component for layout consistency

**Create minimal new components:**
1. `components/projects/project-timeline.tsx` - Visual timeline
2. `components/projects/project-notes.tsx` - Notes list + form
3. `components/members/member-selector.tsx` - Dropdown for member selection

**Why this approach:**
- Reuse existing components (Card, Badge) to minimize new code
- No external date picker libraries - use native HTML5
- Simple, clean UI using Tailwind CSS patterns already in codebase

### Phase 4: Deployment to Vercel

**Prerequisites:**
1. Environment variables setup in Vercel
2. Supabase production configuration
3. Clerk production setup

**Steps:**
1. Connect GitHub repo to Vercel
2. Configure environment variables
3. Deploy
4. Set up Clerk webhook for production
5. Test production deployment

## File Changes Summary

**New Files (4):**
- `supabase/migrations/add-project-features.sql` - Schema updates
- `lib/actions/notes.ts` - Notes CRUD operations
- `components/projects/project-timeline.tsx` - Timeline UI
- `components/projects/project-notes.tsx` - Notes UI
- `components/members/member-selector.tsx` - Member dropdown

**Modified Files (5):**
- `lib/actions/projects.ts` - Add date/assignee fields
- `app/(dashboard)/projects/new/page.tsx` - Enhanced creation form
- `app/(dashboard)/projects/[id]/page.tsx` - Add timeline + notes sections
- `types/database.ts` - Update type definitions
- `supabase/schema.sql` - Document new schema (for reference)

**Total: ~9 file changes**

## UI Design Approach

**Color Scheme (existing):**
- Primary: Blue (already used in buttons)
- Status colors: Green (active), Yellow (pending), Red (overdue - new)

**Layout Pattern:**
- Continue 3-column grid on project detail page
- Timeline at top (full width)
- Left column: Documents + Notes
- Right column: Members + Details + Assignee

**Component Reuse:**
- Card for sections
- Badge for status/dates
- Inline buttons for actions
- Simple forms with Tailwind styles

## Token Efficiency Strategy

1. **Batch operations** - Write migration + actions together
2. **Copy patterns** - Reuse existing action/component patterns extensively
3. **Minimal dependencies** - No new npm packages
4. **Simple UI** - Tailwind classes, no complex state management
5. **Strategic deployment** - Automate with Vercel CLI

## Risk Mitigation

1. **Database migration** - Create as separate migration file, can rollback
2. **Backward compatibility** - New fields are nullable, won't break existing data
3. **Testing** - Test locally before deploying
4. **Deployment** - Use Vercel preview deployments first

## Execution Order

1. ✅ Create database migration
2. ✅ Run migration on Supabase
3. ✅ Update types/database.ts
4. ✅ Create notes actions
5. ✅ Update project actions
6. ✅ Create new UI components
7. ✅ Update project forms
8. ✅ Update project detail page
9. ✅ Test locally
10. ✅ Deploy to Vercel
11. ✅ Configure production webhooks

## Expected Outcome

- Modern project management app with:
  - ✅ Project timelines (start/due dates)
  - ✅ Assignment tracking
  - ✅ Member management UI
  - ✅ Notes/comments system
  - ✅ Clean, professional UI
  - ✅ Live on Vercel with custom domain support
  - ✅ Automatic Clerk user syncing via webhooks
