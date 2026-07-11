"use client";

import { useParams } from "next/navigation";

export default function ThemePreviewPage() {
  const params = useParams();
  const slug = params?.slug as string;

  return (
    <main style={{ minHeight: "100vh", background: "#000" }}>
      <iframe
        src={`/matches/overlay?theme=${encodeURIComponent(slug)}&preview=true`}
        style={{
          width: "100%",
          height: "100vh",
          border: "none",
        }}
      />
    </main>
  );
}
