"use client";

import { useParams } from "next/navigation";

// Standalone preview page — redirects to the correct overlay URL with preview=true
// Used if someone bookmarks or navigates to /themes/preview/[slug] directly
export default function ThemePreviewPage() {
  const params = useParams();
  const slug = params?.slug as string;

  return (
    <main style={{ minHeight: "100vh", background: "#000" }}>
      <iframe
        src={`/matches/overlay/overlay?theme=${encodeURIComponent(slug)}&preview=true`}
        style={{
          width: "100%",
          height: "100vh",
          border: "none",
          display: "block",
        }}
        title={`Preview: ${slug}`}
        allow="autoplay"
      />
    </main>
  );
}
