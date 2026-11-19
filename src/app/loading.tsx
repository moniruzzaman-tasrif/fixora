export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50">
      <div
        className="size-10 animate-spin rounded-full border-4 border-slate-200 border-t-teal-700"
        role="status"
        aria-label="Loading"
      />
    </main>
  );
}
