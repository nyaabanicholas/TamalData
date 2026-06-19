export default function DashboardLoading() {
  return (
    <main className="min-h-screen bg-bg-base">
      <div className="container-content py-10 space-y-8 animate-pulse">
        {/* Welcome banner skeleton */}
        <div className="liquid-glass rounded-2xl p-8 h-40" />

        {/* Stats strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="liquid-glass rounded-2xl p-5 h-28" />
          ))}
        </div>

        {/* Network grid + quick actions */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="liquid-glass rounded-2xl p-6 h-56" />
          <div className="liquid-glass rounded-2xl p-6 h-56" />
        </div>

        {/* Recent orders table */}
        <div className="liquid-glass rounded-2xl p-6 h-64" />
      </div>
    </main>
  );
}
