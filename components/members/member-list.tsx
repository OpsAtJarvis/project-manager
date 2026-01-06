'use client';

import { useState } from 'react';
import { removeProjectMember } from '@/lib/actions/members';
import { Button } from '@/components/ui/button';
import { Database } from '@/types/database';

type Member = Database['public']['Tables']['project_members']['Row'] & {
  user: Database['public']['Tables']['users']['Row'];
};

export function MemberList({
  members,
  projectId,
  ownerId,
  isOwner,
}: {
  members: Member[];
  projectId: string;
  ownerId: string;
  isOwner: boolean;
}) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleRemove = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) {
      return;
    }

    setLoading(userId);
    try {
      await removeProjectMember(projectId, userId);
    } catch (error) {
      console.error('Failed to remove member:', error);
    } finally {
      setLoading(null);
    }
  };

  if (members.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 text-sm">
        <p>No members yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {members.map((member) => {
        const isProjectOwner = member.user_id === ownerId;

        return (
          <div
            key={member.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div className="flex items-center gap-3">
              {member.user.avatar_url ? (
                <img
                  src={member.user.avatar_url}
                  alt={member.user.first_name || member.user.email}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                  {(member.user.first_name?.[0] || member.user.email[0]).toUpperCase()}
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {member.user.first_name && member.user.last_name
                    ? `${member.user.first_name} ${member.user.last_name}`
                    : member.user.email}
                  {isProjectOwner && (
                    <span className="ml-2 text-xs text-blue-600 font-semibold">
                      (Owner)
                    </span>
                  )}
                </p>
                <p className="text-xs text-gray-500">{member.user.email}</p>
              </div>
            </div>

            {isOwner && !isProjectOwner && (
              <Button
                size="sm"
                variant="danger"
                onClick={() => handleRemove(member.user_id)}
                disabled={loading === member.user_id}
              >
                {loading === member.user_id ? 'Removing...' : 'Remove'}
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
}
