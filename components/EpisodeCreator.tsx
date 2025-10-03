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

  async function callGenerate() {
    setLoading('generate');
    const r = await fetch(`/api/episodes/${episodeId}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ seriesTitle, theme, tone, setting, characters, language, episodeNumber }),
    });
    const j = await r.json();
    setResult(j);
    setLoading('idle');
  }

  async function callRender() {
    setLoading('render');
    const r = await fetch(`/api/episodes/${episodeId}/render`, { method: 'POST' });
    const j = await r.json();
    setRendered(j);
    setLoading('idle');
  }

  async function callPublish() {
    setLoading('publish');
    const r = await fetch(`/api/episodes/${episodeId}/publish`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ publishCarousel: true, publishReel: true }) });
    const j = await r.json();
    setPublishResp(j);
    setLoading('idle');
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
          <button className="bg-white text-black rounded-xl px-4 py-2" onClick={callGenerate} disabled={loading!=='idle'}>Generate</button>
          <button className="bg-zinc-200 text-black rounded-xl px-4 py-2" onClick={callRender} disabled={loading!=='idle'}>Render</button>
          <button className="bg-green-500 text-black rounded-xl px-4 py-2" onClick={callPublish} disabled={loading!=='idle'}>Publish</button>
        </div>
        <div className="text-sm text-zinc-400 mt-2">State: {loading}</div>
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
            {rendered.panels.map((p)=> (
              <div key={p} className="aspect-[4/5] bg-zinc-800 rounded" />
            ))}
          </div>
          <h3 className="font-semibold mt-4">Trailer</h3>
          <div className="aspect-[9/16] bg-zinc-800 rounded" />
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


