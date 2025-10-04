"use client";
export default function Uploader() {
  return (
    <label className="inline-flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
      <input type="file" className="hidden" />
      <span className="rounded-xl bg-zinc-800 px-3 py-1">Upload asset</span>
    </label>
  );
}



