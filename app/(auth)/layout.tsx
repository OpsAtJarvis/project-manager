export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Project Manager
          </h1>
          <p className="text-gray-600">
            Manage your projects and documents with ease
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
