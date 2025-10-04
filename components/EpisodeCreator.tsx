"use client";
import { useState } from 'react';

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
    <div className="mt-6 grid gap-4">
      <div className="rounded-2xl bg-zinc-900 p-5 shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input className="bg-zinc-800 rounded px-3 py-2" placeholder="Episode ID" value={episodeId} onChange={e=>setEpisodeId(e.target.value)}/>
          <input className="bg-zinc-800 rounded px-3 py-2" placeholder="Series Title" value={seriesTitle} onChange={e=>setSeriesTitle(e.target.value)}/>
          <input className="bg-zinc-800 rounded px-3 py-2" placeholder="Theme" value={theme} onChange={e=>setTheme(e.target.value)}/>
          <select className="bg-zinc-800 rounded px-3 py-2" value={tone} onChange={e=>setTone(e.target.value as any)}>
            <option value="fantasy">fantasy</option>
            <option value="comedy">comedy</option>
            <option value="epic">epic</option>
          </select>
          <input className="bg-zinc-800 rounded px-3 py-2" placeholder="Setting" value={setting} onChange={e=>setSetting(e.target.value)}/>
          <input className="bg-zinc-800 rounded px-3 py-2" placeholder="Characters (CSV)" value={characters} onChange={e=>setCharacters(e.target.value)}/>
          <input className="bg-zinc-800 rounded px-3 py-2" placeholder="Language" value={language} onChange={e=>setLanguage(e.target.value)}/>
          <input className="bg-zinc-800 rounded px-3 py-2" type="number" placeholder="Episode Number" value={episodeNumber} onChange={e=>setEpisodeNumber(parseInt(e.target.value || '1'))}/>
        </div>
        <div className="flex gap-3 mt-4">
          <button 
            className={`rounded-xl px-4 py-2 transition-all ${
              loading === 'generate' 
                ? 'bg-blue-500 text-white animate-pulse' 
                : 'bg-white text-black hover:bg-gray-100'
            }`} 
            onClick={callGenerate} 
            disabled={loading!=='idle'}
          >
            {loading === 'generate' ? 'Generating...' : 'Generate'}
          </button>
          <button 
            className={`rounded-xl px-4 py-2 transition-all ${
              loading === 'render' 
                ? 'bg-blue-500 text-white animate-pulse' 
                : 'bg-zinc-200 text-black hover:bg-zinc-300'
            }`} 
            onClick={callRender} 
            disabled={loading!=='idle'}
          >
            {loading === 'render' ? 'Rendering...' : 'Render'}
          </button>
          <button 
            className={`rounded-xl px-4 py-2 transition-all ${
              loading === 'publish' 
                ? 'bg-blue-500 text-white animate-pulse' 
                : 'bg-green-500 text-black hover:bg-green-400'
            }`} 
            onClick={callPublish} 
            disabled={loading!=='idle'}
          >
            {loading === 'publish' ? 'Publishing...' : 'Publish'}
          </button>
        </div>
            <div className="text-sm text-zinc-400 mt-2">State: {loading}</div>
            {error && (
              <div className="mt-3 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                <div className="text-red-400 text-sm font-medium">Error:</div>
                <div className="text-red-300 text-sm mt-1">{error}</div>
              </div>
            )}
          </div>

      {result && (
        <div className="rounded-2xl bg-zinc-900 p-5">
          <h3 className="font-semibold">Generated</h3>
          <pre className="text-xs whitespace-pre-wrap text-zinc-300">{JSON.stringify(result.script, null, 2)}</pre>
        </div>
      )}
      {rendered && (
        <div className="rounded-2xl bg-zinc-900 p-5">
          <h3 className="font-semibold">Panels</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
            {rendered.panels.map((p, index)=> (
              <div key={p} className="aspect-[4/5] bg-zinc-800 rounded overflow-hidden">
                <img 
                  src={p} 
                  alt={`Panel ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <div className="hidden w-full h-full flex items-center justify-center text-zinc-400 text-sm">
                  Loading...
                </div>
              </div>
            ))}
          </div>
          <h3 className="font-semibold mt-4">Trailer</h3>
          <div className="aspect-[9/16] bg-zinc-800 rounded overflow-hidden">
            <video 
              src={rendered.trailer} 
              controls 
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <div className="hidden w-full h-full flex items-center justify-center text-zinc-400 text-sm">
              Loading video...
            </div>
          </div>
        </div>
      )}
      {publishResp && (
        <div className="rounded-2xl bg-zinc-900 p-5">
          <h3 className="font-semibold">Publish response</h3>
          <pre className="text-xs whitespace-pre-wrap text-zinc-300">{JSON.stringify(publishResp, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}



