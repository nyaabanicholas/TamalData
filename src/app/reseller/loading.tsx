export default function ResellerLoading() {
  return (
    <main className="min-h-screen bg-bg-base">
      <div className="container-content py-10 space-y-6 animate-pulse">
        <div className="liquid-glass rounded-2xl p-6 h-28" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="liquid-glass rounded-2xl p-5 h-24" />
          ))}
        </div>
        <div className="liquid-glass rounded-2xl p-6 h-72" />
      </div>
    </main>
  );
}
