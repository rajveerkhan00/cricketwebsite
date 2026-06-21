"use client";

export default function Integrations() {
  return (
    <section className="bg-[#03041c] pb-16 pt-8 px-6 md:px-12 w-full flex flex-col items-center justify-center font-outfit select-none border-t border-zinc-800/40">
      
      {/* Copyright Text */}
      <div className="text-zinc-400 text-xs md:text-sm tracking-wider font-semibold mb-12 text-center">
        &copy; 2026 CrickproBD- Live Cricket Scoring Overlay App | ALL RIGHTS RESERVED
      </div>

      {/* Brand Logos Row */}
      <div className="mx-auto max-w-5xl w-full grid grid-cols-2 md:grid-cols-4 gap-6 items-center justify-items-center">
        
        {/* vMix Logo Card */}
        <div className="w-full max-w-[220px] aspect-[2.2/1] bg-white rounded-lg flex items-center justify-center p-4 transition-transform duration-300 hover:scale-105 shadow-md shadow-black/25">
          <div className="flex items-center gap-3">
            {/* vMix Grid Icon */}
            <div className="grid grid-cols-3 gap-0.5 w-12 h-12">
              <div className="bg-[#1e40af] rounded-sm" />
              <div className="bg-[#1e40af] rounded-sm" />
              <div className="bg-[#1e40af] rounded-sm" />
              <div className="bg-[#1e40af] rounded-sm" />
              <div className="bg-[#1e40af] rounded-sm" />
              <div className="bg-[#15803d] rounded-sm" />
              <div className="bg-[#d97706] rounded-sm" />
              <div className="bg-[#1e40af] rounded-sm" />
              <div className="bg-[#1e40af] rounded-sm" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xl font-extrabold text-black leading-none tracking-tight">vMix</span>
              <span className="text-xs font-bold text-blue-900 tracking-wider">Software</span>
            </div>
          </div>
        </div>

        {/* OBS Studio Logo Card */}
        <div className="w-full max-w-[220px] aspect-[2.2/1] bg-[#171c3a] rounded-lg flex items-center justify-center p-4 transition-transform duration-300 hover:scale-105 shadow-md shadow-black/25 border border-zinc-800/60">
          <div className="flex items-center gap-3">
            {/* OBS Blade Circle Icon */}
            <div className="relative w-12 h-12 rounded-full border-2 border-white flex items-center justify-center">
              <svg className="w-8 h-8 text-white fill-current animate-[spin_20s_linear_infinite]" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.66 0 3 1.34 3 3v3.57c0 .87.57 1.63 1.42 1.87l.48.15-.9 1.8z" />
              </svg>
            </div>
            <div className="flex flex-col text-left">
              <span className="text-lg font-black text-white leading-none tracking-wider">OBS</span>
              <span className="text-[10px] font-bold text-zinc-400 tracking-widest uppercase">Studio</span>
            </div>
          </div>
        </div>

        {/* PRISM Live Studio Logo Card */}
        <div className="w-full max-w-[220px] aspect-[2.2/1] bg-[#111111] rounded-lg flex items-center justify-center p-4 transition-transform duration-300 hover:scale-105 shadow-md shadow-black/25 border border-zinc-800/60">
          <div className="flex flex-col items-center justify-center">
            {/* Triangle icon */}
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3L2 20h20L12 3z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9l-5 9h10l-5-9z" />
            </svg>
            <span className="text-[10px] font-bold text-zinc-400 tracking-wider mt-1 uppercase">
              <span className="text-white font-black">PRISM</span> Live Studio
            </span>
          </div>
        </div>

        {/* CameraFi Live Logo Card */}
        <div className="w-full max-w-[220px] aspect-[2.2/1] bg-[#ff4a5a] rounded-lg flex items-center justify-center p-4 transition-transform duration-300 hover:scale-105 shadow-md shadow-black/25">
          <div className="flex items-center gap-2">
            {/* Camera Icon */}
            <div className="bg-white rounded px-2.5 py-1.5 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff4a5a] animate-pulse" />
              <span className="text-xs font-black text-[#ff4a5a] tracking-tight">LIVE</span>
              <svg className="w-4 h-4 text-[#ff4a5a]" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
              </svg>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
