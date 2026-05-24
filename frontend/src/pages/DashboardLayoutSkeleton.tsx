// Loading skeleton for DashboardLayout
export function DashboardLayoutSkeleton() {
  return (
    <div className="min-h-screen bg-background animate-pulse">
      <div className="h-16 bg-card border-b border-border" />
      <div className="flex">
        <div className="w-64 h-screen bg-card border-r border-border" />
        <main className="flex-1 p-8">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6" />
          <div className="grid grid-cols-3 gap-6">
            <div className="h-32 bg-gray-200 rounded-lg" />
            <div className="h-32 bg-gray-200 rounded-lg" />
            <div className="h-32 bg-gray-200 rounded-lg" />
          </div>
        </main>
      </div>
    </div>
  );
}