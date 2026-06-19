export default function Loading() {
  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="font-heading text-2xl text-text-muted animate-pulse">
          TamalData
        </div>
        <div className="h-1 w-24 bg-color-border rounded-full animate-pulse" />
      </div>
    </div>
  );
}
