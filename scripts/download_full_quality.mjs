import fs from 'fs';
import path from 'path';

async function downloadFullQuality() {
  const assets = [
    {
      name: 'this-is-fine.gif',
      candidates: [
        'https://media.tenor.com/MYZgsN2TDJAAAAAC/this-is.gif',
        'https://media.tenor.com/MYZgsN2TDJAAAAAM/this-is.gif',
        'https://media.tenor.com/-kZOB16tELEAAAAC/this-is-fine-fire.gif',
        'https://media.tenor.com/-kZOB16tELEAAAAM/this-is-fine-fire.gif'
      ]
    },
    {
      name: 'gatsby-toast.gif',
      candidates: [
        'https://media.tenor.com/1Nc6rtScQEUAAAAC/thats-it-yes-thats-it.gif',
        'https://media.tenor.com/1Nc6rtScQEUAAAAM/thats-it-yes-thats-it.gif',
        'https://media.tenor.com/1Nc6rtScQEUAAAAd/thats-it-yes-thats-it.gif'
      ]
    }
  ];

  for (const asset of assets) {
    let downloaded = false;
    for (const url of asset.candidates) {
      try {
        console.log(`Trying ${url} for ${asset.name}...`);
        const res = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        if (res.ok) {
          const buffer = Buffer.from(await res.arrayBuffer());
          const destPath = path.resolve('public/assets', asset.name);
          fs.writeFileSync(destPath, buffer);
          console.log(`-> Successfully downloaded ${asset.name} from ${url} (${buffer.length} bytes)`);
          downloaded = true;
          break;
        } else {
          console.log(`Status ${res.status} for ${url}`);
        }
      } catch (e) {
        console.log(`Failed for ${url}:`, e.message);
      }
    }
    if (!downloaded) {
      throw new Error(`Failed to download ${asset.name}`);
    }
  }
}

downloadFullQuality();
