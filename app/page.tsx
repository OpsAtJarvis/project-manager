import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function Home() {
  const { userId } = await auth();
  
  if (userId) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-6">
          Project Manager
        </h1>
        <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
          Collaborate with your team, manage projects, and track documents all in one place.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/sign-up"
            className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
          >
            Get Started
          </Link>
          <Link
            href="/sign-in"
            className="px-8 py-3 bg-white text-indigo-600 border-2 border-indigo-600 rounded-lg font-semibold hover:bg-indigo-50 transition"
          >
            Sign In
          </Link>
        </div>
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 bg-white rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-2">Multi-Tenant</h3>
            <p className="text-gray-600">Organize work across multiple organizations</p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-2">Team Collaboration</h3>
            <p className="text-gray-600">Assign team members to projects</p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-2">Document Management</h3>
            <p className="text-gray-600">Upload PDFs and track their status</p>
          </div>
        </div>
      </div>
    </div>
  );
}
