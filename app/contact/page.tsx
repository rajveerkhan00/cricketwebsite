"use client";

import Header from "../components/Header";
import Footer from "../components/Footer";

export default function Contact() {
  return (
    <div className="flex flex-col min-h-screen w-full bg-[#03041c] text-white font-sans">
      <Header />

      <main className="flex-1 py-20 px-6 md:px-12 max-w-5xl mx-auto flex flex-col gap-12 font-outfit">
        {/* Title */}
        <div className="text-center flex flex-col gap-4">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight font-space">
            Get In <span className="text-amber-500">Touch</span>
          </h1>
          <p className="text-zinc-400 text-lg max-w-xl mx-auto leading-relaxed">
            Have questions about integrations or license keys? Drop us a line.
          </p>
        </div>

        {/* Contact info + form grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-stretch mt-6">
          
          {/* Info Side */}
          <div className="md:col-span-5 flex flex-col justify-between bg-[#07092e] border border-zinc-800/60 rounded-xl p-8 gap-8">
            <div className="flex flex-col gap-6">
              <h3 className="text-xl font-bold font-space text-zinc-100">
                Contact Information
              </h3>
              <p className="text-zinc-400 text-sm font-light leading-relaxed">
                Reach out to us directly or fill out the form and our team will get back to you within 24 hours.
              </p>

              <div className="rounded-xl border border-zinc-800/60 bg-[#0b1038] p-4 flex flex-col gap-3">
                <h4 className="text-sm font-bold tracking-wider text-zinc-100 uppercase">Website Owners</h4>
                <div className="flex flex-col gap-2">
                  {[
                    { name: "Shahzaib", role: "Founder & Lead Strategist" },
                    { name: "Rashid", role: "Founder & Product Lead" },
                  ].map((owner, idx) => (
                    <div key={idx}>
                      <p className="text-sm font-semibold text-white">{owner.name}</p>
                      <p className="text-xs text-amber-500">{owner.role}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-4">
                <span className="flex items-center justify-center w-10 h-10 rounded-full bg-red-500/10 text-red-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </span>
                <div className="flex flex-col text-sm">
                  <span className="text-zinc-400 font-light">Location</span>
                  <span className="font-semibold text-zinc-200">Sherpur, Dhaka, Bangladesh</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="flex items-center justify-center w-10 h-10 rounded-full bg-zinc-500/10 text-zinc-300">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </span>
                <div className="flex flex-col text-sm">
                  <span className="text-zinc-400 font-light">Email Us</span>
                  <a href="mailto:SUPPORT@CricOverlay.COM" className="font-semibold text-zinc-200 hover:text-white transition-colors">
    cricovelay@gmail.com                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="flex items-center justify-center w-10 h-10 rounded-full bg-red-500/10 text-red-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </span>
                <div className="flex flex-col text-sm">
                  <span className="text-zinc-400 font-light">Call Us</span>
                  <a href="tel:+3013113580" className="font-semibold text-zinc-200 hover:text-white transition-colors">
                    +3013113580
                  </a>
                </div>
              </div>
            </div>

            <div className="text-[10px] text-zinc-500 font-semibold tracking-wider">
              CricOverlay TEAM CO.
            </div>
          </div>

          {/* Form Side */}
          <div className="md:col-span-7 bg-[#07092e] border border-zinc-800/60 rounded-xl p-8">
            <form className="flex flex-col gap-5" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold tracking-wider text-zinc-300 uppercase">
                    Your Name
                  </label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    className="w-full bg-[#121542] border border-zinc-800 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold tracking-wider text-zinc-300 uppercase">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    className="w-full bg-[#121542] border border-zinc-800 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold tracking-wider text-zinc-300 uppercase">
                  Subject
                </label>
                <input
                  type="text"
                  placeholder="How can we help?"
                  className="w-full bg-[#121542] border border-zinc-800 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold tracking-wider text-zinc-300 uppercase">
                  Message Details
                </label>
                <textarea
                  placeholder="Tell us what you need..."
                  rows={5}
                  className="w-full bg-[#121542] border border-zinc-800 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold py-3.5 rounded-lg transition-all duration-200 tracking-wider text-sm mt-2"
              >
                SEND MESSAGE
              </button>
            </form>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
