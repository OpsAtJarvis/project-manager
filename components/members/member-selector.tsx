'use client';

export function MemberSelector({
  members,
  currentValue,
  name = "assigned_to"
}: {
  members: any[];
  currentValue?: string | null;
  name?: string;
}) {
  return (
    <select
      name={name}
      defaultValue={currentValue || ''}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    >
      <option value="">Unassigned</option>
      {members?.map((member) => (
        <option key={member.user_id || member.id} value={member.user_id || member.id}>
          {member.user?.first_name || member.first_name} {member.user?.last_name || member.last_name} ({member.user?.email || member.email})
        </option>
      ))}
    </select>
  );
}
