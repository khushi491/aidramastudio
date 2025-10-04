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
      <div className="glass rounded-3xl p-8">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold gradient-text mb-2">Episode Library</h2>
          <p className="text-gray-400">Your created episodes</p>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass rounded-2xl p-6 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-700 rounded-xl"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-700 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-700 rounded w-2/3"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass rounded-3xl p-8">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold gradient-text mb-2">Episode Library</h2>
          <p className="text-gray-400">Your created episodes</p>
        </div>
        <div className="bg-red-900/20 border border-red-500/30 rounded-2xl p-6 text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-red-400 mb-2">Error Loading Episodes</h3>
          <p className="text-red-300 mb-4">{error}</p>
          <button 
            onClick={fetchEpisodes}
            className="btn-primary"
          >
            <span>🔄</span>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-3xl p-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold gradient-text mb-2">Episode Library</h2>
        <p className="text-gray-400">Your created episodes</p>
        <button 
          onClick={fetchEpisodes}
          className="mt-4 px-4 py-2 glass rounded-xl text-gray-300 hover:text-white hover:bg-white/5 transition-all"
        >
          <span className="mr-2">🔄</span>
          Refresh
        </button>
      </div>
      
      {episodes.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎭</div>
          <h3 className="text-xl font-semibold mb-2">No episodes yet</h3>
          <p className="text-gray-400">Create your first episode above to get started!</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {episodes.map((episode, index) => (
            <div key={episode.id} className="glass rounded-2xl p-6 card-hover slide-in" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="flex items-start gap-6">
                {/* Episode Number Badge */}
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                    {episode.number}
                  </div>
                </div>
                
                {/* Episode Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-xl font-semibold text-white">Episode {episode.number}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      episode.status === 'published' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                      episode.status === 'rendered' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                      'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                    }`}>
                      {episode.status === 'published' ? '🚀 Published' :
                       episode.status === 'rendered' ? '🎬 Rendered' :
                       '📝 Draft'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-gray-400">Theme</div>
                      <div className="text-white">{episode.theme}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-gray-400">Tone</div>
                      <div className="text-white capitalize">{episode.tone}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-gray-400">Setting</div>
                      <div className="text-white">{episode.setting}</div>
                    </div>
                  </div>
                  
                  {episode.synopsis && (
                    <div className="mb-4">
                      <div className="text-sm font-medium text-gray-400 mb-1">Synopsis</div>
                      <div className="text-gray-300 text-sm leading-relaxed">{episode.synopsis}</div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      Created {new Date(episode.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex gap-2">
                      <button className="px-3 py-1 bg-gray-700/50 text-gray-300 rounded-lg text-xs hover:bg-gray-600/50 transition-all">
                        View
                      </button>
                      <button className="px-3 py-1 bg-indigo-500/20 text-indigo-400 rounded-lg text-xs hover:bg-indigo-500/30 transition-all">
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
