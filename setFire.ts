import { parse } from "https://deno.land/std@0.114.0/path/mod.ts";
import {
  Frame,
  GIF,
  Image,
} from "https://deno.land/x/imagescript@1.2.9/ImageScript.js";

import rawGif from "./rawGif.ts";

// const FIRE_GIF_SIZE = { height: 128, width: 128 };

const processArgs = (args: string[]) => {
  if (args.length < 1) {
    console.error("Must input one file name");
    Deno.exit(1);
  } else if (args.length > 1) {
    console.warn("Will only process the first image file");
  }

  const inputFilePath = Deno.args[0];
  const { name } = parse(inputFilePath);
  return { inputFilePath, fileName: name };
};

const { inputFilePath, fileName } = processArgs(Deno.args);

const fireGif = await GIF.decode(rawGif);

const inputImage = await Image.decode(await Deno.readFile(inputFilePath));

const frameArray = [];

for (const frame of fireGif) {
  const { duration, xOffset, yOffset, disposalMode } = frame;
  const fireImage = await Image.decode(await frame.encode());
  const outputImage = inputImage.clone();
  outputImage.composite(fireImage, xOffset, yOffset);
  const outputFrame = Frame.from(
    outputImage,
    duration,
    0,
    0,
    disposalMode,
  );
  frameArray.push(outputFrame);
}
const newGif = new GIF(frameArray);

Deno.writeFile(`./${fileName}-fire.gif`, await newGif.encode());
