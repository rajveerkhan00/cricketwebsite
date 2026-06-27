"use client";

export default function Services() {
  const services = [
    {
      title: "Live Stream",
      description: "Stream sports, meetings, and events effortlessly with our cutting-edge live streaming technology. Real-time updates, interactive graphics, and seamless integration make it easy for your audience to stay connected, no matter where they are.",
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      title: "Live Scoring App",
      description: "Track live scores with stunning international graphics that bring every match to life. Our real-time scoring system seamlessly integrates with live video, offering an immersive and professional viewing experience for fans everywhere!",
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2" />
        </svg>
      ),
    },
    {
      title: "Website Development",
      description: "We design and develop professional websites made for your business. Our websites are built to be fast, easy to use, and responsive, ensuring they work seamlessly on any device, helping you connect with your audience and grow online.",
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
  ];

  return (
    <section id="services" className="bg-[#03041c] py-24 px-6 md:px-12 w-full flex flex-col items-center justify-center font-outfit select-none">
      
      {/* Small Category Pill */}
      <div className="mb-4">
        <span className="px-5 py-2 rounded-full border border-zinc-700/60 bg-[#0e1138] text-xs font-semibold tracking-wider text-zinc-300">
          Our Professional Services
        </span>
      </div>

      {/* Title */}
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-16 text-center font-space">
        <span className="text-orange-500">Best</span> Services You Get
      </h2>

      {/* Services Grid */}
      <div className="mx-auto max-w-7xl w-full grid grid-cols-1 md:grid-cols-3 gap-8">
        {services.map((service, index) => (
          <div
            key={index}
            className="flex flex-col items-center text-center bg-[#07092e] hover:bg-[#0a0c3a] border border-zinc-800/40 rounded-xl p-8 transition-colors duration-300 relative group"
          >
            {/* Icon Bubble */}
            <div className="w-16 h-16 rounded-full bg-[#12154a] flex items-center justify-center mb-8 border border-zinc-700/40 group-hover:bg-[#191d63] transition-colors duration-300">
              {service.icon}
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-white mb-4 tracking-wide font-space">
              {service.title}
            </h3>

            {/* Description */}
            <p className="text-zinc-400 text-sm md:text-base leading-relaxed mb-8 font-light flex-1">
              {service.description}
            </p>

            {/* Button */}
            <button className="px-6 py-2.5 rounded border border-zinc-700/80 hover:border-orange-500 text-xs font-bold text-orange-500 tracking-wider transition-colors duration-300">
              READ MORE &rarr;
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
