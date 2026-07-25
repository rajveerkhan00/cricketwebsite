"use client";

import Image from "next/image";

export default function Videos() {
  const videos = [
    {
      title: "CricOverlay PhotoShow",
      thumbnail: "/thumb-scoreboard.png",
      link: "#",
    },
    {
      title: "CricOverlay Tutorial",
      thumbnail: "/thumb-control.png",
      link: "#",
    },
    {
      title: "Camerafi and Prism Live",
      thumbnail: "/thumb-control.png",
      link: "#",
    },
    {
      title: "Cricket Scoring Tutorial",
      thumbnail: "/thumb-scoreboard.png",
      link: "#",
    },
  ];

  return (
    <section className="bg-white py-20 px-6 md:px-12 w-full flex flex-col items-center justify-center font-outfit select-none">

      {/* Title */}
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 mb-16 text-center font-space">
        <span className="text-orange-600">Cricket</span> Videos
      </h2>

      {/* Videos Grid */}
      <div className="mx-auto max-w-7xl w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {videos.map((video, index) => (
          <a
            key={index}
            href={video.link}
            className="flex flex-col bg-white border border-slate-200/90 rounded-2xl overflow-hidden hover:border-orange-400 transition-all duration-300 group shadow-sm hover:shadow-md"
          >
            {/* Thumbnail Wrapper */}
            <div className="relative aspect-video w-full overflow-hidden bg-slate-100 flex items-center justify-center">
              <Image
                src={video.thumbnail}
                alt={video.title}
                fill
                sizes="(max-w-7xl) 25vw, 50vw"
                className="object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
              />

              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/5 transition-colors duration-300">
                <div className="w-14 h-10 bg-red-600 rounded-lg flex items-center justify-center shadow-md group-hover:bg-red-500 group-hover:scale-110 transition-all duration-300">
                  <svg
                    className="w-6 h-6 text-white fill-current translate-x-[1px]"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Video Info */}
            <div className="p-6 flex items-center justify-center text-center">
              <h3 className="text-lg font-bold text-slate-900 tracking-wide group-hover:text-orange-600 transition-colors duration-300 font-space line-clamp-2">
                {video.title}
              </h3>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
