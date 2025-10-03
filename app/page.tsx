import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-semibold">drama-studio</h1>
        <p className="text-zinc-400 mt-2">AI episodic storyteller • panels • trailer • Instagram</p>
        <div className="mt-6">
          <Link href="/dashboard" className="inline-block rounded-2xl bg-white text-black px-5 py-3 hover:opacity-90 transition">
            Open Dashboard
          </Link>
        </div>
        <footer className="mt-10 text-xs text-zinc-500">Freepik assets used</footer>
      </div>
    </main>
  );
}
