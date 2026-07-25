"use client";

import Image from "next/image";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Hero() {
  const { data: session } = useSession();
  const router = useRouter();

  const handleGetStarted = () => {
    if (session) {
      router.push("/tournaments");
    } else {
      router.push("/login");
    }
  };

  return (
    <section className="relative min-h-[80vh] w-full bg-white flex items-center justify-center overflow-hidden py-20 px-6 md:px-12 font-outfit">
      {/* Subtle Light Mesh Background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
          <defs>
            <pattern id="hex-grid" width="45" height="77.942" patternUnits="userSpaceOnUse" patternTransform="scale(1.2)">
              <path d="M 45 0 L 22.5 12.99 M 22.5 12.99 L 0 0 M 0 0 L 0 25.98 M 0 25.98 L 22.5 38.97 M 22.5 38.97 L 45 25.98 M 45 25.98 L 45 0 M 0 38.97 L 22.5 51.96 M 22.5 51.96 L 0 64.95 M 0 64.95 L 0 90.93 M 0 90.93 L 22.5 103.92 M 22.5 103.92 L 45 90.93 M 45 90.93 L 45 64.95 L 22.5 51.96" fill="none" stroke="#e2e8f0" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hex-grid)" />
        </svg>
      </div>

      {/* Modern Soft Glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[45%] h-[45%] rounded-full bg-amber-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[45%] h-[45%] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />

      <div className="mx-auto max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
        
        {/* Left Content */}
        <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left gap-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold tracking-widest text-emerald-700 uppercase shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            Next-Gen Sports Technology
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight font-space">
            CricOverlay - LIVE CRICKET
            <span className="block mt-2 bg-gradient-to-r from-emerald-600 via-teal-600 to-amber-600 bg-clip-text text-transparent">
              SCORING OVERLAY APP
            </span>
          </h1>
          
          <p className="text-slate-600 text-lg md:text-xl max-w-xl leading-relaxed font-normal font-outfit">
            We revolutionize your event experience with top-notch technology. Whether it's live streaming for sports, festivals, or meetings, or providing real-time cricket scoring with stunning international graphics, we have everything you need.
          </p>
          
          <div className="pt-2 flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleGetStarted}
              className="group relative bg-[#1b8c1b] hover:bg-[#157015] active:scale-95 text-white font-bold text-lg px-8 py-3.5 rounded-lg transition-all duration-300 shadow-[0_4px_20px_rgba(27,140,27,0.25)] hover:shadow-[0_4px_25px_rgba(27,140,27,0.4)]"
            >
              Get Started
            </button>
          </div>
        </div>

        {/* Right Content */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center gap-6 relative">
          <div className="relative w-full max-w-[440px] aspect-square flex items-center justify-center">
            <Image
              src="/hero-illustration-transparent-v4.png"
              alt="CricOverlay Scorecard App Display"
              width={440}
              height={440}
              priority
              className="object-contain transform hover:scale-[1.03] transition-transform duration-500 ease-out drop-shadow-lg"
            />
          </div>
          
          <p className="text-xs font-bold tracking-widest text-emerald-800 uppercase text-center mt-2 font-space bg-emerald-50 border border-emerald-200/80 px-4 py-1.5 rounded-full shadow-xs">
            LIVE CRICKET STREAMING SCORECARD SOFTWARE!
          </p>
        </div>

      </div>
    </section>
  );
}


