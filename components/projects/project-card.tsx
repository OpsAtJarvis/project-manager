import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Database } from '@/types/database';

type Project = Database['public']['Tables']['projects']['Row'] & {
  owner: Database['public']['Tables']['users']['Row'];
};

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link href={`/projects/${project.id}`}>
      <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer h-full">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
            {project.name}
          </h3>
          <Badge status={project.status}>{project.status}</Badge>
        </div>

        {project.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {project.description}
          </p>
        )}

        <div className="flex items-center justify-between text-sm text-gray-500 mt-auto">
          <div className="flex items-center gap-2">
            {project.owner.avatar_url ? (
              <img
                src={project.owner.avatar_url}
                alt={project.owner.first_name || project.owner.email}
                className="w-6 h-6 rounded-full"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
                {(project.owner.first_name?.[0] || project.owner.email[0]).toUpperCase()}
              </div>
            )}
            <span className="text-xs">
              {project.owner.first_name || project.owner.email}
            </span>
          </div>
          <span className="text-xs">
            {new Date(project.created_at).toLocaleDateString()}
          </span>
        </div>
      </Card>
    </Link>
  );
}
