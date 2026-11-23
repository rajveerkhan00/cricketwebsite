"use client";

import Image from "next/image";

export default function Videos() {
  const videos = [
    {
      title: "CriOverlay Scoreboard 1",
      thumbnail: "/scoreboard-1.png",
      link: "#",
    },
    {
      title: "CriOverlay Scoreboard 2",
      thumbnail: "/scoreboard-2.png",
      link: "#",
    },
    {
      title: "CriOverlay Scoreboard 3",
      thumbnail: "/scoreboard-3.png",
      link: "#",
    },
    {
      title: "CriOverlay Scoreboard 4",
      thumbnail: "/scoreboard-4.png",
      link: "#",
    },
  ];

  return (
    <section className="bg-white py-20 px-6 md:px-12 w-full flex flex-col items-center justify-center font-outfit select-none">

      {/* Title */}
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 mb-16 text-center font-space">
        <span className="text-orange-600">Cricket</span> Scoreboards
      </h2>

      {/* Scoreboards Grid */}
      <div className="mx-auto max-w-7xl w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {videos.map((video, index) => (
          <div
            key={index}
            className="flex flex-col bg-white border border-slate-200/90 rounded-2xl overflow-hidden hover:border-orange-400 transition-all duration-300 group shadow-sm hover:shadow-md"
          >
            {/* Thumbnail Wrapper */}
            <div className="relative aspect-video w-full overflow-hidden bg-slate-100 flex items-center justify-center">
              <Image
                src={video.thumbnail}
                alt={video.title}
                fill
                sizes="(max-w-7xl) 25vw, 50vw"
                className="object-contain opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
              />
            </div>

            {/* Scoreboard Info */}
            <div className="p-6 flex items-center justify-center text-center">
              <h3 className="text-lg font-bold text-slate-900 tracking-wide group-hover:text-orange-600 transition-colors duration-300 font-space line-clamp-2">
                {video.title}
              </h3>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
