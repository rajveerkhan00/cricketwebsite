"use client";

export default function Footer() {
  const quickLinks = [
    { name: "ABOUT US", href: "#" },
    { name: "SERVICES", href: "#" },
    { name: "PRICING", href: "#" },
    { name: "PRIVACY POLICY", href: "#" },
  ];

  const services = [
    { name: "LIVE SCORING", href: "#" },
    { name: "LIVE STREAMING", href: "#" },
    { name: "TOURNAMENT MANAGEMENT", href: "#" },
    { name: "CRICKET GRAPHICS", href: "#" },
  ];

  return (
    <footer className="bg-[#03041c] border-t border-zinc-800/40 py-16 px-6 md:px-12 w-full flex justify-center font-outfit select-none">
      <div className="mx-auto max-w-7xl w-full grid grid-cols-1 md:grid-cols-3 gap-12 text-left">
        
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
              <a href="mailto:SUPPORT@CRICKPROBD.COM" className="hover:text-white transition-colors">
                SUPPORT@CRICKPROBD.COM
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
    </footer>
  );
}
