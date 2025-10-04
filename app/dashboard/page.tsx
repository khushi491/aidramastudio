import EpisodeCreator from '@/components/EpisodeCreator';
import EpisodeList from '@/components/EpisodeList';

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-black text-white px-6 py-8">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-2xl font-semibold">Dashboard</h2>
        <div className="mt-6 grid gap-6">
          <EpisodeCreator />
          <EpisodeList />
        </div>
      </div>
    </main>
  );
}



