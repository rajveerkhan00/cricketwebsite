"use client";

import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative min-h-[85vh] w-full bg-gradient-to-b from-[#0c0f4f] via-[#05072c] to-[#02041c] flex items-center justify-center overflow-hidden py-20 px-6 md:px-12 font-outfit">
      {/* Subtle Hexagonal Mesh Overlay (Spider Net) */}
      <div className="absolute inset-0 opacity-32 pointer-events-none">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
          <defs>
            <pattern id="hex-grid" width="45" height="77.942" patternUnits="userSpaceOnUse" patternTransform="scale(1.2)">
              <path d="M 45 0 L 22.5 12.99 M 22.5 12.99 L 0 0 M 0 0 L 0 25.98 M 0 25.98 L 22.5 38.97 M 22.5 38.97 L 45 25.98 M 45 25.98 L 45 0 M 0 38.97 L 22.5 51.96 M 22.5 51.96 L 0 64.95 M 0 64.95 L 0 90.93 M 0 90.93 L 22.5 103.92 M 22.5 103.92 L 45 90.93 M 45 90.93 L 45 64.95 L 22.5 51.96" fill="none" stroke="#2d359c" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hex-grid)" />
        </svg>
      </div>

      {/* Modern Radial Gradient Glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/30 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/15 blur-[130px] pointer-events-none" />

      <div className="mx-auto max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
        
        {/* Left Content */}
        <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left gap-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold tracking-widest text-emerald-400 uppercase">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            Next-Gen Sports Technology
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight font-space">
            CricOverlay - LIVE CRICKET
            <span className="block mt-2 bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
              SCORING OVERLAY APP
            </span>
          </h1>
          
          <p className="text-zinc-300 text-lg md:text-xl max-w-xl leading-relaxed font-light font-outfit">
            We revolutionize your event experience with top-notch technology. Whether it's live streaming for sports, festivals, or meetings, or providing real-time cricket scoring with stunning international graphics, we have everything you need.
          </p>
          
          <div className="pt-4 flex flex-col sm:flex-row gap-4">
            <button className="group relative bg-[#1b8c1b] hover:bg-[#157015] active:scale-95 text-white font-bold text-lg px-8 py-3.5 rounded-lg transition-all duration-300 shadow-[0_4px_20px_rgba(27,140,27,0.3)] hover:shadow-[0_4px_25px_rgba(27,140,27,0.5)]">
              Get Started
            </button>
          </div>
        </div>

        {/* Right Content */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center gap-6 relative">
          {/* Subtle Ambient Backplate */}
          <div className="absolute w-[85%] h-[85%] rounded-full bg-gradient-to-tr from-blue-600/10 to-emerald-500/10 blur-[80px] pointer-events-none" />
          
          <div className="relative w-full max-w-[440px] aspect-square flex items-center justify-center">
            <Image
              src="/hero-illustration-transparent-v4.png"
              alt="CricOverlay Scorecard App Display"
              width={440}
              height={440}
              priority
              className="object-contain transform hover:scale-[1.03] transition-transform duration-500 ease-out"
            />
          </div>
          
          <p className="text-xs font-semibold tracking-widest text-emerald-400/80 uppercase text-center mt-2 font-space bg-white/5 border border-white/5 px-4 py-1.5 rounded-full">
            LIVE CRICKET STREAMING SCORECARD SOFTWARE!
          </p>
        </div>

      </div>
    </section>
  );
}


