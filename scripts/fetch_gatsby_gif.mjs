import fs from 'fs';
import path from 'path';

async function fetchGatsbyGif() {
  const sources = [
    'https://i.imgur.com/vHq8m.gif',
    'https://i.imgur.com/4p7tB62.gif',
    'https://i.imgur.com/K0Z8H5V.gif',
    'https://media.giphy.com/media/8Iv5lqKwKsZ2g/giphy.gif',
    'https://media2.giphy.com/media/GCLlQnV7dXY2KGmpBR/giphy.gif',
    'https://media3.giphy.com/media/111ebonMs90YLu/giphy.gif',
    'https://media.tenor.com/SSQRa1kjVKgAAAAC/gif.gif',
    'https://media.tenor.com/IErQHBRt6GIAAAAC/leonardo-dicaprio.gif'
  ];

  for (const url of sources) {
    try {
      console.log(`Checking ${url}...`);
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      if (res.ok) {
        const buffer = Buffer.from(await res.arrayBuffer());
        console.log(`Success from ${url}: ${buffer.length} bytes`);
        if (buffer.length > 100000) {
          const dest = path.resolve('public/assets/gatsby-toast.gif');
          fs.writeFileSync(dest, buffer);
          console.log(`Wrote ${dest}`);
          break;
        }
      }
    } catch (e) {
      console.log(`Failed ${url}:`, e.message);
    }
  }
}

fetchGatsbyGif();
