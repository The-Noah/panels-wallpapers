import {exists} from "https://deno.land/std/fs/mod.ts";
import {readerFromStreamReader} from "https://deno.land/std/io/mod.ts";

const data = await fetch("https://storage.googleapis.com/panels-api/data/20240916/media-1a-i-p~s").then((res) => res.json());
const wallpapers = Object.entries(data.data);

console.log(`Found ${wallpapers.length} wallpapers`);

if (!(await exists("./wallpapers"))) {
  await Deno.mkdir("./wallpapers");
}

for (const image of wallpapers) {
  const [id, data] = image;

  const originalUrl = data.dhd ?? data.dsd

  if (!originalUrl) {
    console.error("Url not found!");
    continue;
  }

  const url = new URL(originalUrl);

  console.log(`Downloading ${id}... (${url})`);

  const response = await fetch(url);
  const streamReader = response.body?.getReader();

  if (!streamReader) {
    console.error("Failed to get reader!");
    continue;
  }

  const reader = readerFromStreamReader(streamReader);

  const file = await Deno.open(`./wallpapers/${url.pathname.split("/").at(-1)}`, {
    write: true,
    create: true,
  });

  await Deno.copy(reader, file);

  file.close();
}
