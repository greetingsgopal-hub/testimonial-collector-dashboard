import fs from 'fs';
import path from 'path';

async function downloadTenorMedia(pageUrl, outputFilename) {
  console.log(`Fetching Tenor page: ${pageUrl}`);
  const res = await fetch(pageUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  });
  const html = await res.text();

  // Look for contentUrl or gif urls
  const gifMatches = [...html.matchAll(/https:\/\/media\.tenor\.com\/[^"'\s]+\.gif/g)].map(m => m[0]);
  console.log(`Found ${gifMatches.length} GIF URLs for ${outputFilename}:`, gifMatches.slice(0, 3));

  let selectedUrl = gifMatches[0];
  if (!selectedUrl) {
    // Look for mp4 or webm or any tenor media
    const anyMatches = [...html.matchAll(/https:\/\/media\.tenor\.com\/[^"'\s]+/g)].map(m => m[0]);
    console.log(`Fallback matches:`, anyMatches.slice(0, 3));
    selectedUrl = anyMatches[0];
  }

  if (!selectedUrl) {
    throw new Error(`Could not find media URL for ${pageUrl}`);
  }

  console.log(`Downloading ${selectedUrl} -> ${outputFilename}...`);
  const mediaRes = await fetch(selectedUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  });

  const arrayBuffer = await mediaRes.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const destDir = path.resolve('public/assets');
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  const destPath = path.join(destDir, outputFilename);
  fs.writeFileSync(destPath, buffer);
  console.log(`Saved ${destPath} (${buffer.length} bytes)`);
}

async function main() {
  try {
    await downloadTenorMedia('https://tenor.com/view/this-is-fine-gif-12307212', 'this-is-fine.gif');
    await downloadTenorMedia('https://tenor.com/view/leonardo-di-caprio-great-gatsby-cheers-celebrate-gif-5645497', 'gatsby-toast.gif');
    console.log('All downloads completed successfully!');
  } catch (err) {
    console.error('Error during download:', err);
    process.exit(1);
  }
}

main();
