import { UserButton } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server';

export async function Header() {
  const { userId } = await auth();

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Welcome back
          </h2>
          <p className="text-sm text-gray-600">
            Manage your projects and team collaboration
          </p>
        </div>

        <div className="flex items-center gap-4">
          <UserButton afterSignOutUrl="/sign-in" />
        </div>
      </div>
    </header>
  );
}
