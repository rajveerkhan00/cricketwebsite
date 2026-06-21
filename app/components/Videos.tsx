"use client";

import Image from "next/image";

export default function Videos() {
  const videos = [
    {
      title: "Crickprobd PhotoShow",
      thumbnail: "/thumb-scoreboard.png",
      link: "#",
    },
    {
      title: "Crickprobd Tutorial",
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
    <section className="bg-[#03041c] py-20 px-6 md:px-12 w-full flex flex-col items-center justify-center font-outfit select-none">

      {/* Title */}
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-16 text-center font-space">
        <span className="text-orange-500">Cricket</span> Videos
      </h2>

      {/* Videos Grid */}
      <div className="mx-auto max-w-7xl w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {videos.map((video, index) => (
          <a
            key={index}
            href={video.link}
            className="flex flex-col bg-[#07092e] border border-zinc-800/40 rounded-xl overflow-hidden hover:border-zinc-700/60 transition-all duration-300 group shadow-lg shadow-black/20"
          >
            {/* Thumbnail Wrapper */}
            <div className="relative aspect-video w-full overflow-hidden bg-black flex items-center justify-center">
              <Image
                src={video.thumbnail}
                alt={video.title}
                fill
                sizes="(max-w-7xl) 25vw, 50vw"
                className="object-cover opacity-80 group-hover:opacity-95 group-hover:scale-105 transition-all duration-500"
              />

              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors duration-300">
                <div className="w-14 h-10 bg-red-600 rounded-lg flex items-center justify-center shadow-lg group-hover:bg-red-500 group-hover:scale-110 transition-all duration-300">
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
              <h3 className="text-lg font-bold text-white tracking-wide group-hover:text-orange-500 transition-colors duration-300 font-space line-clamp-2">
                {video.title}
              </h3>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
