'use client';

export function ProjectTimeline({
  startDate,
  dueDate,
}: {
  startDate: string | null;
  dueDate: string | null;
}) {
  if (!startDate && !dueDate) {
    return (
      <div className="text-sm text-gray-500 italic">
        No timeline set
      </div>
    );
  }

  const start = startDate ? new Date(startDate) : null;
  const due = dueDate ? new Date(dueDate) : null;
  const today = new Date();

  let progress = 0;
  let isOverdue = false;

  if (start && due) {
    const total = due.getTime() - start.getTime();
    const elapsed = today.getTime() - start.getTime();
    progress = Math.min(Math.max((elapsed / total) * 100, 0), 100);
    isOverdue = today > due;
  }

  const formatDate = (date: Date | null) => {
    if (!date) return 'Not set';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between text-sm">
        <div>
          <span className="text-gray-500">Start:</span>{' '}
          <span className="font-medium text-gray-900">{formatDate(start)}</span>
        </div>
        <div>
          <span className="text-gray-500">Due:</span>{' '}
          <span className={`font-medium ${isOverdue ? 'text-red-600' : 'text-gray-900'}`}>
            {formatDate(due)}
          </span>
        </div>
      </div>

      {start && due && (
        <div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full transition-all ${
                isOverdue ? 'bg-red-500' : 'bg-blue-600'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-1 text-xs text-gray-500 text-center">
            {isOverdue ? (
              <span className="text-red-600 font-medium">Overdue</span>
            ) : (
              `${Math.round(progress)}% elapsed`
            )}
          </div>
        </div>
      )}
    </div>
  );
}
