import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, User, Clock } from 'lucide-react';
import { Database } from '@/types/database';
import { formatDistanceToNow } from 'date-fns';

type Project = Database['public']['Tables']['projects']['Row'] & {
  owner: Database['public']['Tables']['users']['Row'];
};

export function ProjectCard({ project }: { project: any }) {
  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return email ? email[0].toUpperCase() : '?';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'on_hold':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDaysUntilDue = () => {
    if (!project.due_date) return null;
    const dueDate = new Date(project.due_date);
    const now = new Date();
    const diffTime = dueDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { text: 'Overdue', color: 'text-red-600' };
    if (diffDays === 0) return { text: 'Due today', color: 'text-orange-600' };
    if (diffDays === 1) return { text: 'Due tomorrow', color: 'text-orange-600' };
    if (diffDays <= 7) return { text: `${diffDays} days left`, color: 'text-yellow-600' };
    return { text: `${diffDays} days left`, color: 'text-gray-600' };
  };

  const dueInfo = getDaysUntilDue();

  return (
    <Link href={`/projects/${project.id}`}>
      <Card className="p-6 hover:shadow-lg transition-all duration-200 cursor-pointer h-full flex flex-col border-2 hover:border-blue-200">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1 flex-1">
            {project.name}
          </h3>
          <Badge className={`ml-2 ${getStatusColor(project.status)} capitalize`}>
            {project.status}
          </Badge>
        </div>

        {/* Description */}
        {project.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-1">
            {project.description}
          </p>
        )}

        {/* Due Date Warning */}
        {dueInfo && (
          <div className={`flex items-center gap-1.5 text-xs font-medium mb-3 ${dueInfo.color}`}>
            <Clock className="h-3.5 w-3.5" />
            {dueInfo.text}
          </div>
        )}

        {/* Timeline */}
        {(project.start_date || project.due_date) && (
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-4 pb-4 border-b">
            <Calendar className="h-3.5 w-3.5" />
            {project.start_date && (
              <span>{new Date(project.start_date).toLocaleDateString()}</span>
            )}
            {project.start_date && project.due_date && <span>→</span>}
            {project.due_date && (
              <span>{new Date(project.due_date).toLocaleDateString()}</span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto">
          {/* Owner */}
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8 border-2 border-white shadow-sm">
              <AvatarImage src={project.owner?.avatar_url} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xs">
                {getInitials(project.owner?.first_name, project.owner?.email)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-gray-700">
                {project.owner?.first_name || project.owner?.email?.split('@')[0]}
              </span>
              <span className="text-xs text-gray-500">Owner</span>
            </div>
          </div>

          {/* Last Updated */}
          <div className="text-right">
            <div className="text-xs text-gray-500">
              Updated {formatDistanceToNow(new Date(project.updated_at), { addSuffix: true })}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
