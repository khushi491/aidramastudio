"use client";
import { useState, useEffect } from 'react';

interface Episode {
  id: string;
  seriesId: string;
  number: number;
  theme: string;
  tone: string;
  setting: string;
  language: string;
  synopsis: string | null;
  status: 'draft' | 'rendered' | 'published';
  createdAt: string;
}

export default function EpisodeList() {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEpisodes();
  }, []);

  async function fetchEpisodes() {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/episodes');
      if (!response.ok) {
        throw new Error('Failed to fetch episodes');
      }
      const data = await response.json();
      setEpisodes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch episodes');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl bg-zinc-900 p-5">
        <div className="animate-pulse">
          <div className="h-6 bg-zinc-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-zinc-700 rounded"></div>
            <div className="h-4 bg-zinc-700 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl bg-zinc-900 p-5">
        <div className="text-red-400 text-sm font-medium">Error:</div>
        <div className="text-red-300 text-sm mt-1">{error}</div>
        <button 
          onClick={fetchEpisodes}
          className="mt-3 bg-zinc-700 text-white rounded px-3 py-1 text-sm hover:bg-zinc-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-zinc-900 p-5">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg">Episodes</h3>
        <button 
          onClick={fetchEpisodes}
          className="bg-zinc-700 text-white rounded px-3 py-1 text-sm hover:bg-zinc-600"
        >
          Refresh
        </button>
      </div>
      
      {episodes.length === 0 ? (
        <div className="text-zinc-400 text-center py-8">
          No episodes found. Create your first episode above!
        </div>
      ) : (
        <div className="space-y-3">
          {episodes.map((episode) => (
            <div key={episode.id} className="bg-zinc-800 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium">Episode {episode.number}</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      episode.status === 'published' ? 'bg-green-900 text-green-300' :
                      episode.status === 'rendered' ? 'bg-blue-900 text-blue-300' :
                      'bg-zinc-700 text-zinc-300'
                    }`}>
                      {episode.status}
                    </span>
                  </div>
                  <div className="text-sm text-zinc-400 mb-2">
                    <div><strong>Theme:</strong> {episode.theme}</div>
                    <div><strong>Tone:</strong> {episode.tone}</div>
                    <div><strong>Setting:</strong> {episode.setting}</div>
                  </div>
                  {episode.synopsis && (
                    <div className="text-sm text-zinc-300">
                      <strong>Synopsis:</strong> {episode.synopsis}
                    </div>
                  )}
                </div>
                <div className="text-xs text-zinc-500 ml-4">
                  {new Date(episode.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
