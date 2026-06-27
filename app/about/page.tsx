"use client";

import Header from "../components/Header";
import Footer from "../components/Footer";

export default function About() {
  return (
    <div className="flex flex-col min-h-screen w-full bg-[#03041c] text-white font-sans">
      <Header />
      
      <main className="flex-1 py-20 px-6 md:px-12 max-w-5xl mx-auto flex flex-col gap-12 font-outfit">
        {/* Title */}
        <div className="text-center flex flex-col gap-4">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight font-space">
            About <span className="text-amber-500">CricOverlay</span>
          </h1>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Empowering sports broadcasters, commentators, and fans with real-time scoring overlay technologies.
          </p>
        </div>

        {/* Content Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center mt-6">
          <div className="md:col-span-2 bg-[#07092e] border border-zinc-800/60 rounded-xl p-8 flex flex-col gap-6">
            <h2 className="text-2xl font-bold font-space text-zinc-100">
              Meet Our Owners
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { name: "Shahzaib", role: "Founder & Lead Strategist" },
                { name: "Rashid", role: "Founder & Product Lead" },
              ].map((owner, idx) => (
                <div key={idx} className="rounded-xl border border-zinc-800/60 bg-[#0b1038] p-5">
                  <h3 className="text-xl font-semibold text-white">{owner.name}</h3>
                  <p className="text-sm text-amber-500 mt-1">{owner.role}</p>
                  <p className="text-sm text-zinc-400 mt-3 leading-relaxed">
                    Passionate about building high-quality cricket broadcasting experiences and helping creators grow their digital presence.
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <h2 className="text-2xl font-bold font-space text-zinc-100">
              Our Mission
            </h2>
            <p className="text-zinc-300 leading-relaxed font-light">
              At CricOverlay, we believe sports broadcasting should be accessible, professional, and visually engaging for everyone. We design tools that allow local leagues, tournament organizers, and content creators to stream matches with broadcast-quality graphics instantly.
            </p>
            <p className="text-zinc-300 leading-relaxed font-light">
              Whether you are commentating on a local club tournament or streaming a school league, our live scorecard overlays bring the premium feel of international sports channels straight to your audience.
            </p>
          </div>
          <div className="bg-[#07092e] border border-zinc-800/60 rounded-xl p-8 flex flex-col gap-6">
            <h3 className="text-xl font-bold font-space text-amber-500">
              Why Choose Us?
            </h3>
            <ul className="flex flex-col gap-4 text-sm font-semibold tracking-wide text-zinc-300">
              <li className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                Real-Time Scoreboard Synchronizing
              </li>
              <li className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                Seamless OBS & Streamlabs Integrations
              </li>
              <li className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                Customizable Graphic Theme Sets
              </li>
              <li className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                Responsive Layouts for All Devices
              </li>
            </ul>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
