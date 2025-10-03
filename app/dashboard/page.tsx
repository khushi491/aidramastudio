import EpisodeCreator from '@/components/EpisodeCreator';

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-black text-white px-6 py-8">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-2xl font-semibold">Dashboard</h2>
        <EpisodeCreator />
      </div>
    </main>
  );
}


