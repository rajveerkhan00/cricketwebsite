"use client";

export default function Services() {
  const services = [
    {
      title: "Live Stream",
      description: "Stream sports, meetings, and events effortlessly with our cutting-edge live streaming technology. Real-time updates, interactive graphics, and seamless integration make it easy for your audience to stay connected, no matter where they are.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      title: "Live Scoring App",
      description: "Track live scores with stunning international graphics that bring every match to life. Our real-time scoring system seamlessly integrates with live video, offering an immersive and professional viewing experience for fans everywhere!",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2" />
        </svg>
      ),
    },
    {
      title: "Website Development",
      description: "We design and develop professional websites made for your business. Our websites are built to be fast, easy to use, and responsive, ensuring they work seamlessly on any device, helping you connect with your audience and grow online.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
  ];

  return (
    <section id="services" className="bg-white py-24 px-6 md:px-12 w-full flex flex-col items-center justify-center font-outfit select-none">
      
      {/* Small Category Pill */}
      <div className="mb-4">
        <span className="px-5 py-2 rounded-full border border-slate-200 bg-slate-50 text-xs font-bold tracking-wider text-slate-700 shadow-xs">
          Our Professional Services
        </span>
      </div>

      {/* Title */}
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 mb-16 text-center font-space">
        <span className="text-orange-600">Best</span> Services You Get
      </h2>

      {/* Services Grid */}
      <div className="mx-auto max-w-7xl w-full grid grid-cols-1 md:grid-cols-3 gap-8">
        {services.map((service, index) => (
          <div
            key={index}
            className="flex flex-col items-center text-center bg-white hover:bg-slate-50/80 border border-slate-200/90 rounded-2xl p-8 transition-all duration-300 relative group shadow-sm hover:shadow-md hover:border-orange-400"
          >
            {/* Icon Bubble */}
            <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center mb-8 border border-orange-200 group-hover:bg-orange-500 transition-colors duration-300">
              <div className="text-orange-600 group-hover:text-white transition-colors duration-300">
                {service.icon}
              </div>
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-slate-900 mb-4 tracking-wide font-space">
              {service.title}
            </h3>

            {/* Description */}
            <p className="text-slate-600 text-sm md:text-base leading-relaxed mb-8 font-normal flex-1">
              {service.description}
            </p>

            {/* Button */}
            <button className="px-6 py-2.5 rounded-lg border border-slate-300 hover:border-orange-500 hover:bg-orange-500 hover:text-white text-xs font-bold text-orange-600 tracking-wider transition-all duration-300 cursor-pointer">
              READ MORE &rarr;
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
