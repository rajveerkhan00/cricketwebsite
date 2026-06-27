"use client";

export default function Footer() {
  const quickLinks = [
    { name: "ABOUT US", href: "/about" },
    { name: "SERVICES", href: "/#services" },
    { name: "PRICING", href: "/pricing" },
    { name: "PRIVACY POLICY", href: "/privacy-policy" },
  ];

  const services = [
    { name: "LIVE SCORING", href: "/#services" },
    { name: "LIVE STREAMING", href: "/#services" },
    { name: "TOURNAMENT MANAGEMENT", href: "/#services" },
    { name: "CRICKET GRAPHICS", href: "/#services" },
  ];

  const owners = [
    { name: "Shahzaib", role: "Founder & Lead Strategist" },
    { name: "Rashid", role: "Founder & Product Lead" },
  ];

  return (
    <footer className="bg-[#03041c] border-t border-zinc-800/40 py-16 px-6 md:px-12 w-full flex justify-center font-outfit select-none">
      <div className="mx-auto max-w-7xl w-full flex flex-col gap-10 text-left">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          
          {/* Column 1: Quick Links */}
          <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h3 className="text-white text-lg font-bold tracking-wider font-space uppercase">
              Quick Links
            </h3>
            <span className="w-10 h-[3px] bg-orange-500 rounded-full" />
          </div>
          <ul className="flex flex-col gap-3 font-semibold text-sm tracking-wider">
            {quickLinks.map((link, idx) => (
              <li key={idx} className="group">
                <a href={link.href} className="text-zinc-400 hover:text-white transition-colors duration-200 flex items-center gap-2">
                  <span className="text-orange-500 font-bold transition-transform duration-200 group-hover:translate-x-1">&rarr;</span>
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
          </div>

          {/* Column 2: Services */}
          <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h3 className="text-white text-lg font-bold tracking-wider font-space uppercase">
              Services
            </h3>
            <span className="w-10 h-[3px] bg-orange-500 rounded-full" />
          </div>
          <ul className="flex flex-col gap-3 font-semibold text-sm tracking-wider">
            {services.map((service, idx) => (
              <li key={idx} className="group">
                <a href={service.href} className="text-zinc-400 hover:text-white transition-colors duration-200 flex items-center gap-2">
                  <span className="text-orange-500 font-bold transition-transform duration-200 group-hover:translate-x-1">&rarr;</span>
                  {service.name}
                </a>
              </li>
            ))}
          </ul>
          </div>

          {/* Column 3: Contact Us */}
          <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h3 className="text-white text-lg font-bold tracking-wider font-space uppercase">
              Contact Us
            </h3>
            <span className="w-10 h-[3px] bg-orange-500 rounded-full" />
          </div>
          <ul className="flex flex-col gap-4 font-semibold text-sm tracking-wider text-zinc-400">
            {/* Address */}
            <li className="flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-red-500/10 text-red-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </span>
              <span>SHERPUR, DHAKA, BANGLADESH</span>
            </li>
            
            {/* Email */}
            <li className="flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-500/10 text-zinc-300">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </span>
              <a href="mailto:SUPPORT@CricOverlay.COM" className="hover:text-white transition-colors">
                SUPPORT@CricOverlay.COM
              </a>
            </li>

            {/* Phone */}
            <li className="flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-red-500/10 text-red-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </span>
              <a href="tel:+8801912229606" className="hover:text-white transition-colors">
                +8801912229606
              </a>
            </li>
          </ul>
        </div>

        </div>

        <div className="relative rounded-[24px] border border-zinc-800/70 bg-gradient-to-r from-[#0d133d] via-[#0a1034] to-[#060924] p-5 md:p-6 shadow-[0_0_30px_rgba(255,140,0,0.08)] overflow-hidden">
          {/* Hexagonal Mesh Overlay */}
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
              <defs>
                <pattern id="owner-hex-grid" width="45" height="77.942" patternUnits="userSpaceOnUse" patternTransform="scale(1.2)">
                  <path d="M 45 0 L 22.5 12.99 M 22.5 12.99 L 0 0 M 0 0 L 0 25.98 M 0 25.98 L 22.5 38.97 M 22.5 38.97 L 45 25.98 M 45 25.98 L 45 0 M 0 38.97 L 22.5 51.96 M 22.5 51.96 L 0 64.95 M 0 64.95 L 0 90.93 M 0 90.93 L 22.5 103.92 M 22.5 103.92 L 45 90.93 M 45 90.93 L 45 64.95 L 22.5 51.96" fill="none" stroke="#ff8c00" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#owner-hex-grid)" />
            </svg>
          </div>

          {/* Radial Gradient Glows */}
          <div className="absolute top-[-20%] right-[-15%] w-[40%] h-[40%] rounded-full bg-orange-600/25 blur-[100px] pointer-events-none" />
          <div className="absolute bottom-[-20%] left-[-15%] w-[40%] h-[40%] rounded-full bg-cyan-500/15 blur-[100px] pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-3 w-3 rounded-full bg-orange-500 shadow-[0_0_12px_rgba(249,115,22,0.7)]" />
              <h4 className="text-white text-sm font-bold tracking-[0.25em] uppercase">Meet Our Owners</h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full md:w-auto">
              {owners.map((owner, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-zinc-800/70 bg-[#11174a]/90 px-4 py-3 min-w-[180px] transition-all duration-300 hover:-translate-y-1 hover:border-orange-500/50 hover:shadow-[0_0_20px_rgba(249,115,22,0.15)]"
                >
                  <p className="text-sm font-semibold text-white">{owner.name}</p>
                  <p className="text-xs font-medium tracking-wide text-zinc-400 mt-1">{owner.role}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
