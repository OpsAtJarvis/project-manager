# Project Manager

A modern, full-stack project management application built with Next.js 15, Clerk authentication, and Supabase database.

## Features

- User authentication and organization management with Clerk
- Multi-tenant architecture with row-level security
- Project creation and management
- PDF document upload and status tracking
- Team member management
- Real-time updates and optimistic UI
- Responsive design with Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Authentication**: Clerk
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **Styling**: Tailwind CSS
- **Deployment**: Vercel (recommended)

## Getting Started

See [SETUP.md](./SETUP.md) for detailed setup instructions.

### Quick Start

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
# Fill in your Clerk and Supabase credentials
```

3. Run the development server:
```bash
npm run dev
```

4. Open http://localhost:3000 in your browser

## Project Structure

```
project-manager/
├── app/                     # Next.js app directory
│   ├── (auth)/             # Authentication pages
│   ├── (dashboard)/        # Dashboard pages
│   ├── api/                # API routes
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Landing page
├── components/             # React components
│   ├── ui/                 # Reusable UI components
│   ├── projects/           # Project-related components
│   ├── documents/          # Document-related components
│   ├── members/            # Member-related components
│   └── layout/             # Layout components
├── lib/                    # Utilities and helpers
│   ├── actions/            # Server actions
│   └── supabase/           # Supabase clients
├── supabase/               # Database schema and policies
│   ├── schema.sql          # Database schema
│   └── rls-policies.sql    # Row-level security policies
├── types/                  # TypeScript type definitions
│   └── database.ts         # Database types
└── middleware.ts           # Next.js middleware
```

## Key Concepts

### Authentication Flow
1. Users sign in/up via Clerk
2. Clerk syncs user data to Supabase via webhooks
3. Clerk JWT tokens are used for Supabase authentication
4. Row-level security policies enforce access control

### Multi-tenancy
- Organizations are managed by Clerk
- All data is scoped to organizations
- RLS policies ensure data isolation
- Users can belong to multiple organizations

### Document Management
- PDF files are uploaded to Supabase Storage
- Document metadata is stored in PostgreSQL
- Status tracking: pending, approved, rejected
- Project owners can manage document statuses

### Security
- Row-level security on all tables
- Organization-based access control
- JWT-based authentication
- Service role key for webhooks only

## Environment Variables

Required environment variables:

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

See `.env.example` for a complete list.

## Database Schema

The application uses the following main tables:

- `users` - User profiles synced from Clerk
- `organizations` - Organizations synced from Clerk
- `org_members` - Organization membership
- `projects` - Projects within organizations
- `project_members` - Project team members
- `documents` - Document metadata

See `supabase/schema.sql` for the complete schema.

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Other Platforms

The app can be deployed to any platform that supports Next.js 15:
- Netlify
- Railway
- Digital Ocean
- AWS Amplify

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

For setup help, see [SETUP.md](./SETUP.md)

For issues or questions, please open an issue on GitHub.
