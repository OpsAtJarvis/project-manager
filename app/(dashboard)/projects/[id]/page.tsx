import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getProject } from '@/lib/actions/projects';
import { getProjectMembers } from '@/lib/actions/members';
import { getNotes } from '@/lib/actions/notes';
import { Badge } from '@/components/ui/badge';
import { DocumentUpload } from '@/components/documents/document-upload';
import { DocumentList } from '@/components/documents/document-list';
import { MemberList } from '@/components/members/member-list';
import { ProjectTimeline } from '@/components/projects/project-timeline';
import { ProjectNotes } from '@/components/projects/project-notes';
import { Card } from '@/components/ui/card';
import Link from 'next/link';

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();
  const { id } = await params;

  if (!userId) {
    redirect('/sign-in');
  }

  const { data: project, error } = await getProject(id);

  if (error || !project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Project Not Found
        </h1>
        <p className="text-gray-600 mb-6">
          The project you're looking for doesn't exist or you don't have access to it.
        </p>
        <Link href="/projects" className="inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 px-4 py-2 text-sm">
          Back to Projects
        </Link>
      </div>
    );
  }

  const { data: members } = await getProjectMembers(id);
  const membersList: any[] = members || [];
  const { data: notes } = await getNotes(id);
  const proj: any = project;
  const isOwner = proj.owner_id === userId;

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold text-gray-900">{proj.name}</h1>
            <Badge status={proj.status}>{proj.status}</Badge>
          </div>
          <Link href="/projects" className="inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500 px-4 py-2 text-sm">
            Back to Projects
          </Link>
        </div>
        {proj.description && (
          <p className="text-gray-600">{proj.description}</p>
        )}
        <div className="mt-2 text-sm text-gray-500">
          Created by {proj.owner.first_name || proj.owner.email} on{' '}
          {new Date(proj.created_at).toLocaleDateString()}
        </div>
      </div>

      <div className="mb-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h2>
          <ProjectTimeline startDate={proj.start_date} dueDate={proj.due_date} />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Documents
            </h2>
            <DocumentUpload projectId={proj.id} />
            <div className="mt-6">
              <DocumentList documents={proj.documents || []} projectId={proj.id} isOwner={isOwner} />
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Notes
            </h2>
            <ProjectNotes notes={notes || []} projectId={proj.id} currentUserId={userId} />
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Project Members
            </h2>
            <MemberList
              members={membersList}
              projectId={proj.id}
              ownerId={proj.owner_id}
              isOwner={isOwner}
            />
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Project Details
            </h2>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-gray-500">Status</dt>
                <dd className="font-medium text-gray-900">{proj.status}</dd>
              </div>
              {proj.assigned_to && (
                <div>
                  <dt className="text-gray-500">Assigned To</dt>
                  <dd className="font-medium text-gray-900">
                    {membersList?.find((m: any) => m.user_id === proj.assigned_to)?.user?.first_name || 'Unknown'}
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-gray-500">Created</dt>
                <dd className="font-medium text-gray-900">
                  {new Date(proj.created_at).toLocaleDateString()}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Last Updated</dt>
                <dd className="font-medium text-gray-900">
                  {new Date(proj.updated_at).toLocaleDateString()}
                </dd>
              </div>
            </dl>
          </Card>
        </div>
      </div>
    </div>
  );
}
