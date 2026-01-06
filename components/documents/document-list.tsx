'use client';

import { useState } from 'react';
import { deleteDocument, updateDocumentStatus } from '@/lib/actions/documents';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Database } from '@/types/database';

type Document = Database['public']['Tables']['documents']['Row'];

export function DocumentList({
  documents,
  projectId,
  isOwner,
}: {
  documents: Document[];
  projectId: string;
  isOwner: boolean;
}) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleDelete = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) {
      return;
    }

    setLoading(documentId);
    try {
      await deleteDocument(documentId);
    } catch (error) {
      console.error('Failed to delete document:', error);
    } finally {
      setLoading(null);
    }
  };

  const handleStatusChange = async (documentId: string, newStatus: string) => {
    setLoading(documentId);
    try {
      await updateDocumentStatus(documentId, newStatus);
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setLoading(null);
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Unknown';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(1)} MB`;
  };

  if (documents.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No documents uploaded yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {documents.map((doc) => (
        <div
          key={doc.id}
          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <svg
                className="w-8 h-8 text-red-500 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {doc.name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(doc.file_size)} • {new Date(doc.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 ml-4">
            <Badge status={doc.status}>{doc.status}</Badge>

            {isOwner && (
              <select
                value={doc.status}
                onChange={(e) => handleStatusChange(doc.id, e.target.value)}
                disabled={loading === doc.id}
                className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            )}

            <Button
              size="sm"
              variant="danger"
              onClick={() => handleDelete(doc.id)}
              disabled={loading === doc.id}
            >
              {loading === doc.id ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
