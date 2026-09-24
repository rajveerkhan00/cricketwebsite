import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const imagePath = path.join(process.cwd(), "public", "image2.jpeg");
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Data = imageBuffer.toString("base64");

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 128 128" width="128" height="128">
  <defs>
    <clipPath id="circleClip">
      <circle cx="64" cy="64" r="64" />
    </clipPath>
  </defs>
  <g clip-path="url(#circleClip)">
    <image xlink:href="data:image/jpeg;base64,${base64Data}" href="data:image/jpeg;base64,${base64Data}" x="0" y="0" width="128" height="128" preserveAspectRatio="xMidYMid slice" />
  </g>
</svg>`;

    const svgPath = path.join(process.cwd(), "public", "favicon.svg");
    try {
      fs.writeFileSync(svgPath, svg, "utf-8");
    } catch {}

    return new NextResponse(svg, {
      status: 200,
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Error generating round favicon:", error);
    return new NextResponse("", { status: 500 });
  }
}
