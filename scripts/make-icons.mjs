import { Jimp } from "jimp";
import { mkdirSync } from "fs";

const SRC = "public/image2.jpeg";
const OUT_DIR = "public/icons";

mkdirSync(OUT_DIR, { recursive: true });

for (const size of [192, 512]) {
  const image = await Jimp.read(SRC);
  image.cover({ w: size, h: size });
  image.circle(); // circular mask, matches header/favicon style
  await image.write(`${OUT_DIR}/icon-${size}.png`);
  console.log(`wrote ${OUT_DIR}/icon-${size}.png`);
}
