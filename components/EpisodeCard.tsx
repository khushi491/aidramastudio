export default function EpisodeCard({ title, status }: { title: string; status: string }) {
  return (
    <div className="rounded-2xl bg-zinc-900 p-4 shadow flex items-center justify-between">
      <div>
        <div className="font-medium">{title}</div>
        <div className="text-xs text-zinc-500">{status}</div>
      </div>
      <div className="text-xs text-zinc-400">Publish</div>
    </div>
  );
}



