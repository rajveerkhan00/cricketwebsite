import { Jimp } from "jimp";

const SRC = "public/image2.jpeg";
const SIZE = 180;

const logo = await Jimp.read(SRC);
logo.cover({ w: SIZE, h: SIZE });
logo.circle();

// iOS fills transparent areas with black — use a white background instead
const canvas = new Jimp({ width: SIZE, height: SIZE, color: 0xffffffff });
canvas.composite(logo, 0, 0);

await canvas.write("public/icons/apple-touch-icon.png");
console.log("wrote public/icons/apple-touch-icon.png");
