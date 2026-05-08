export default function DashboardPlaceholder() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-6 pb-24 pt-28 text-center">
      <h1 className="font-display text-2xl font-bold text-white">Dashboard</h1>
      <p className="mt-2 max-w-md text-zinc-400">
        Wire your Supabase-backed dashboard here. This route exists so Navbar
        links don&apos;t 404 during development.
      </p>
    </main>
  );
}
