"use client";
import { useState } from 'react';
import ComicBookLayout from './ComicBookLayout';

export default function EpisodeCreator() {
  const [episodeId, setEpisodeId] = useState<string>('ep1');
  const [seriesTitle, setSeriesTitle] = useState('Subway Thrones');
  const [theme, setTheme] = useState('subway intrigue');
  const [tone, setTone] = useState<'fantasy' | 'comedy' | 'epic'>('fantasy');
  const [setting, setSetting] = useState('NYC Subway Kingdom');
  const [characters, setCharacters] = useState('Lena (brave engineer), Mako (schemer prince)');
  const [episodeNumber, setEpisodeNumber] = useState(1);
  const [language, setLanguage] = useState('en');
  const [loading, setLoading] = useState<'idle'|'generate'|'render'|'publish'>('idle');
  const [result, setResult] = useState<any>(null);
  const [rendered, setRendered] = useState<{panels:string[]; trailer:string}|null>(null);
  const [publishResp, setPublishResp] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'create' | 'preview' | 'publish'>('create');
  const [viewMode, setViewMode] = useState<'grid' | 'book'>('grid');

  async function callGenerate() {
    setLoading('generate');
    setError(null);
    try {
      const r = await fetch(`/api/episodes/${episodeId}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seriesTitle, theme, tone, setting, characters, language, episodeNumber }),
      });
      const j = await r.json();
      if (!r.ok) {
        throw new Error(j.error || 'Generation failed');
      }
      setResult(j);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setLoading('idle');
    }
  }

  async function callRender() {
    setLoading('render');
    setError(null);
    try {
      const r = await fetch(`/api/episodes/${episodeId}/render`, { method: 'POST' });
      const j = await r.json();
      if (!r.ok) {
        throw new Error(j.error || 'Render failed');
      }
      setRendered(j);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Render failed');
    } finally {
      setLoading('idle');
    }
  }

  async function callPublish() {
    setLoading('publish');
    setError(null);
    try {
      const r = await fetch(`/api/episodes/${episodeId}/publish`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ publishCarousel: true, publishReel: true }) });
      const j = await r.json();
      if (!r.ok) {
        throw new Error(j.error || 'Publish failed');
      }
      setPublishResp(j);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Publish failed');
    } finally {
      setLoading('idle');
    }
  }

  return (
    <div className="glass rounded-3xl p-8 card-hover">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold gradient-text mb-2">Episode Creator</h2>
        <p className="text-gray-400">Create your next cinematic drama episode</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center mb-8">
        <div className="glass rounded-2xl p-1 flex">
          {[
            { id: 'create', label: 'Create', icon: '🎬' },
            { id: 'preview', label: 'Preview', icon: '👁️' },
            { id: 'publish', label: 'Publish', icon: '🚀' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 rounded-xl transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Create Tab */}
      {activeTab === 'create' && (
        <div className="space-y-6">
          {/* Form Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Episode ID</label>
              <input 
                className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-400 input-focus" 
                placeholder="ep1" 
                value={episodeId} 
                onChange={e=>setEpisodeId(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Series Title</label>
              <input 
                className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-400 input-focus" 
                placeholder="Subway Thrones" 
                value={seriesTitle} 
                onChange={e=>setSeriesTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Theme</label>
              <input 
                className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-400 input-focus" 
                placeholder="subway intrigue" 
                value={theme} 
                onChange={e=>setTheme(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Tone</label>
              <select 
                className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white input-focus" 
                value={tone} 
                onChange={e=>setTone(e.target.value as any)}
              >
                <option value="fantasy">🎭 Fantasy</option>
                <option value="comedy">😄 Comedy</option>
                <option value="epic">⚔️ Epic</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Setting</label>
              <input 
                className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-400 input-focus" 
                placeholder="NYC Subway Kingdom" 
                value={setting} 
                onChange={e=>setSetting(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Characters</label>
              <input 
                className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-400 input-focus" 
                placeholder="Lena (brave engineer), Mako (schemer prince)" 
                value={characters} 
                onChange={e=>setCharacters(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Language</label>
              <input 
                className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-400 input-focus" 
                placeholder="en" 
                value={language} 
                onChange={e=>setLanguage(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Episode Number</label>
              <input 
                className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-400 input-focus" 
                type="number" 
                placeholder="1" 
                value={episodeNumber} 
                onChange={e=>setEpisodeNumber(parseInt(e.target.value || '1'))}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 justify-center">
            <button 
              className={`btn-primary flex items-center gap-2 ${
                loading === 'generate' ? 'pulse-glow' : ''
              }`}
              onClick={callGenerate} 
              disabled={loading!=='idle'}
            >
              {loading === 'generate' ? (
                <>
                  <div className="spinner"></div>
                  Generating...
                </>
              ) : (
                <>
                  <span>✨</span>
                  Generate Script
                </>
              )}
            </button>
            <button 
              className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                loading === 'render' 
                  ? 'bg-blue-500 text-white pulse-glow' 
                  : 'bg-gray-700 text-white hover:bg-gray-600'
              }`}
              onClick={callRender} 
              disabled={loading!=='idle'}
            >
              {loading === 'render' ? (
                <>
                  <div className="spinner"></div>
                  Rendering...
                </>
              ) : (
                <>
                  <span>🎨</span>
                  Render Video
                </>
              )}
            </button>
            <button 
              className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                loading === 'publish' 
                  ? 'bg-green-500 text-white pulse-glow' 
                  : 'bg-green-600 text-white hover:bg-green-500'
              }`}
              onClick={callPublish} 
              disabled={loading!=='idle'}
            >
              {loading === 'publish' ? (
                <>
                  <div className="spinner"></div>
                  Publishing...
                </>
              ) : (
                <>
                  <span>🚀</span>
                  Publish
                </>
              )}
            </button>
          </div>

          {/* Status */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full">
              <div className={`w-2 h-2 rounded-full ${
                loading === 'idle' ? 'bg-gray-400' : 
                loading === 'generate' ? 'bg-blue-400 animate-pulse' :
                loading === 'render' ? 'bg-yellow-400 animate-pulse' :
                'bg-green-400 animate-pulse'
              }`}></div>
              <span className="text-sm text-gray-300">
                {loading === 'idle' ? 'Ready' : 
                 loading === 'generate' ? 'Generating script...' :
                 loading === 'render' ? 'Rendering video...' :
                 'Publishing...'}
              </span>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 slide-in">
              <div className="flex items-center gap-2 text-red-400 font-medium">
                <span>⚠️</span>
                Error
              </div>
              <div className="text-red-300 text-sm mt-2">{error}</div>
            </div>
          )}
        </div>
      )}

      {/* Preview Tab */}
      {activeTab === 'preview' && (
        <div className="space-y-6">
          {result && (
            <div className="glass rounded-2xl p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span>📝</span>
                Generated Script
              </h3>
              <div className="bg-gray-900/50 rounded-xl p-4 overflow-auto max-h-96">
                <pre className="text-sm text-gray-300 whitespace-pre-wrap">
                  {JSON.stringify(result.script, null, 2)}
                </pre>
              </div>
            </div>
          )}
          
          {rendered && (
            <div className="space-y-6">
              {/* View Mode Toggle */}
              <div className="flex justify-center mb-6">
                <div className="glass rounded-2xl p-1 flex">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-6 py-3 rounded-xl transition-all ${
                      viewMode === 'grid'
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span className="mr-2">🔲</span>
                    Grid View
                  </button>
                  <button
                    onClick={() => setViewMode('book')}
                    className={`px-6 py-3 rounded-xl transition-all ${
                      viewMode === 'book'
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span className="mr-2">📚</span>
                    Book View
                  </button>
                </div>
              </div>

              {/* Grid View */}
              {viewMode === 'grid' && (
                <div className="glass rounded-2xl p-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <span>🎨</span>
                    Comic Panels
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {rendered.panels.map((p, index)=> (
                      <div key={p} className="aspect-[4/5] bg-gray-800 rounded-xl overflow-hidden card-hover group">
                        <img 
                          src={p} 
                          alt={`Panel ${index + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                        <div className="hidden w-full h-full flex items-center justify-center text-gray-400 text-sm">
                          <div className="text-center">
                            <div className="spinner mx-auto mb-2"></div>
                            Loading...
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Book View */}
              {viewMode === 'book' && (
                <ComicBookLayout 
                  panels={rendered.panels} 
                  title={seriesTitle}
                  episodeNumber={episodeNumber}
                />
              )}
              
              <div className="glass rounded-2xl p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <span>🎬</span>
                  Trailer Video
                </h3>
                <div className="aspect-[9/16] max-w-sm mx-auto bg-gray-800 rounded-xl overflow-hidden">
                  <video 
                    src={rendered.trailer} 
                    controls 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                  <div className="hidden w-full h-full flex items-center justify-center text-gray-400 text-sm">
                    <div className="text-center">
                      <div className="spinner mx-auto mb-2"></div>
                      Loading video...
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!result && !rendered && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎭</div>
              <h3 className="text-xl font-semibold mb-2">No content yet</h3>
              <p className="text-gray-400">Generate and render your episode to see the preview</p>
            </div>
          )}
        </div>
      )}

      {/* Publish Tab */}
      {activeTab === 'publish' && (
        <div className="space-y-6">
          {publishResp && (
            <div className="glass rounded-2xl p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span>🚀</span>
                Publish Results
              </h3>
              <div className="bg-gray-900/50 rounded-xl p-4 overflow-auto max-h-96">
                <pre className="text-sm text-gray-300 whitespace-pre-wrap">
                  {JSON.stringify(publishResp, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {!publishResp && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📡</div>
              <h3 className="text-xl font-semibold mb-2">Ready to publish</h3>
              <p className="text-gray-400">Generate and render your episode first, then publish to social media</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}



