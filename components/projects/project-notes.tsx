'use client';

import { useState } from 'react';
import { createNote, deleteNote } from '@/lib/actions/notes';

export function ProjectNotes({
  notes,
  projectId,
  currentUserId,
}: {
  notes: any[];
  projectId: string;
  currentUserId: string;
}) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    setError(null);

    const result = await createNote(projectId, content);

    if (result.error) {
      setError(result.error);
    } else {
      setContent('');
    }

    setLoading(false);
  };

  const handleDelete = async (noteId: string) => {
    if (!confirm('Delete this note?')) return;

    const result = await deleteNote(noteId, projectId);
    if (result.error) {
      alert(result.error);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-2">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Add a note..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          disabled={loading}
        />
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
        <button
          type="submit"
          disabled={loading || !content.trim()}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
        >
          {loading ? 'Adding...' : 'Add Note'}
        </button>
      </form>

      <div className="space-y-3">
        {notes?.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">No notes yet</p>
        ) : (
          notes?.map((note) => (
            <div
              key={note.id}
              className="bg-gray-50 rounded-lg p-3 border border-gray-200"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="text-xs text-gray-500">
                  <span className="font-medium text-gray-700">
                    {note.user?.first_name || note.user?.email}
                  </span>
                  {' · '}
                  {new Date(note.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </div>
                {note.user_id === currentUserId && (
                  <button
                    onClick={() => handleDelete(note.id)}
                    className="text-red-600 hover:text-red-700 text-xs"
                  >
                    Delete
                  </button>
                )}
              </div>
              <p className="text-sm text-gray-900 whitespace-pre-wrap">
                {note.content}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
