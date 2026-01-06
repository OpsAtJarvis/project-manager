import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { createProject } from '@/lib/actions/projects';
import { getOrgMembers } from '@/lib/actions/members';
import { Card } from '@/components/ui/card';
import { MemberSelector } from '@/components/members/member-selector';
import Link from 'next/link';

export default async function NewProjectPage() {
  const { userId, orgId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  if (!orgId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          No Organization Selected
        </h1>
        <p className="text-gray-600 mb-6">
          Please select or create an organization to create projects.
        </p>
      </div>
    );
  }

  const { data: members } = await getOrgMembers();

  async function handleCreateProject(formData: FormData) {
    'use server';

    const result = await createProject(formData);

    if (result.error) {
      throw new Error(result.error);
    }

    redirect('/projects');
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Create New Project
        </h1>
        <p className="text-gray-600">
          Start a new project and invite team members to collaborate.
        </p>
      </div>

      <Card className="p-6">
        <form action={handleCreateProject} className="space-y-6">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Project Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter project name"
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Description (Optional)
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter project description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="start_date"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Start Date (Optional)
              </label>
              <input
                type="date"
                id="start_date"
                name="start_date"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label
                htmlFor="due_date"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Due Date (Optional)
              </label>
              <input
                type="date"
                id="due_date"
                name="due_date"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="assigned_to"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Assign To (Optional)
            </label>
            <MemberSelector members={members || []} />
          </div>

          <div className="flex gap-4">
            <button type="submit" className="flex-1 inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 px-4 py-2 text-sm">
              Create Project
            </button>
            <Link href="/projects" className="flex-1 inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500 px-4 py-2 text-sm">
              Cancel
            </Link>
          </div>        </form>
      </Card>
    </div>
  );
}
