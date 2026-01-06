'use client';

import { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, SortAsc } from 'lucide-react';
import { ProjectCard } from './project-card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface ProjectsListProps {
  projects: any[];
}

export function ProjectsList({ projects }: ProjectsListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('updated');

  // Filter and sort logic
  const filterAndSort = (projectList: any[], status?: string) => {
    let filtered = projectList;

    // Filter by status
    if (status) {
      filtered = filtered.filter(p => p.status === status);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.owner?.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.owner?.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.owner?.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'created':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'updated':
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        case 'due_date':
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  };

  const allProjects = useMemo(() => filterAndSort(projects), [projects, searchQuery, sortBy]);
  const activeProjects = useMemo(() => filterAndSort(projects, 'active'), [projects, searchQuery, sortBy]);
  const completedProjects = useMemo(() => filterAndSort(projects, 'completed'), [projects, searchQuery, sortBy]);

  const EmptyState = ({ message }: { message: string }) => (
    <div className="bg-white rounded-lg border p-12 text-center">
      <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Search className="h-10 w-10 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{message}</h3>
      <p className="text-gray-600 mb-6">
        {searchQuery ? 'Try adjusting your search criteria.' : 'Get started by creating your first project.'}
      </p>
      {!searchQuery && (
        <Link href="/projects/new">
          <Button>Create Project</Button>
        </Link>
      )}
    </div>
  );

  const ProjectGrid = ({ projectList, emptyMessage }: { projectList: any[]; emptyMessage: string }) => (
    <>
      {projectList.length === 0 ? (
        <EmptyState message={emptyMessage} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projectList.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </>
  );

  return (
    <div className="space-y-6">
      {/* Search and Sort Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search projects, owners..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SortAsc className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="updated">Recently Updated</SelectItem>
            <SelectItem value="created">Recently Created</SelectItem>
            <SelectItem value="name">Name (A-Z)</SelectItem>
            <SelectItem value="due_date">Due Date</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabs for filtering */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="all">
            All ({allProjects.length})
          </TabsTrigger>
          <TabsTrigger value="active">
            Active ({activeProjects.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completedProjects.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <ProjectGrid projectList={allProjects} emptyMessage="No projects found" />
        </TabsContent>

        <TabsContent value="active" className="mt-6">
          <ProjectGrid projectList={activeProjects} emptyMessage="No active projects" />
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          <ProjectGrid projectList={completedProjects} emptyMessage="No completed projects" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
