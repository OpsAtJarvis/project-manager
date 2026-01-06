import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getProjects } from '@/lib/actions/projects';
import { ProjectCard } from '@/components/projects/project-card';
import Link from 'next/link';

export default async function DashboardPage() {
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
          Please select or create an organization to get started.
        </p>
      </div>
    );
  }

  const { data: projects } = await getProjects();
  const projectList = projects || [];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">
          Welcome back! Here's an overview of your projects.
        </p>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Recent Projects</h2>
        <Link href="/projects/new" className="inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 px-4 py-2 text-sm">
          Create Project
        </Link>
      </div>

      {projectList.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No projects yet
          </h3>
          <p className="text-gray-600 mb-4">
            Get started by creating your first project.
          </p>
          <Link href="/projects/new" className="inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 px-4 py-2 text-sm">
            Create Your First Project
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projectList.slice(0, 6).map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      {projectList.length > 6 && (
        <div className="mt-6 text-center">
          <Link href="/projects" className="inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500 px-4 py-2 text-sm">
            View All Projects
          </Link>
        </div>
      )}
    </div>
  );
}
