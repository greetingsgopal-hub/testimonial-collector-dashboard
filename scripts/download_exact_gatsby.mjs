import fs from 'fs';
import path from 'path';

async function downloadExactGatsby() {
  // Let's search Tenor API for "gatsby cheers" or "leonardo dicaprio cheers"
  const searchUrl = 'https://tenor.googleapis.com/v2/search?q=gatsby%20cheers%20leonardo%20dicaprio&key=LIVDSRZULELA&limit=5';
  try {
    const res = await fetch(searchUrl);
    const data = await res.json();
    console.log('Tenor API results:', data.results?.map(r => ({ id: r.id, title: r.title, url: r.media_formats?.gif?.url })));
    
    if (data.results && data.results.length > 0) {
      // Find the one with gatsby cheers
      const target = data.results.find(r => r.id === '5645497') || data.results[0];
      const gifUrl = target.media_formats?.gif?.url || target.media_formats?.mediumgif?.url;
      console.log('Selected GIF URL:', gifUrl);
      
      const gifRes = await fetch(gifUrl);
      const buffer = Buffer.from(await gifRes.arrayBuffer());
      fs.writeFileSync(path.resolve('public/assets/gatsby-toast.gif'), buffer);
      console.log('Saved exact gatsby-toast.gif:', buffer.length, 'bytes');
      return;
    }
  } catch (e) {
    console.log('Tenor API query error:', e.message);
  }

  // Fallback direct CDN URLs for Leonardo DiCaprio Great Gatsby Toast
  const candidates = [
    'https://media1.giphy.com/media/BPJmthQ3YRwD6/giphy.gif',
    'https://i.giphy.com/media/BPJmthQ3YRwD6/giphy.gif',
    'https://media.giphy.com/media/8Iv5lqKwKsZ2g/giphy.gif',
    'https://c.tenor.com/1Nc6rtScQEUAAAAC/thats-it-yes-thats-it.gif'
  ];

  for (const url of candidates) {
    try {
      console.log('Fetching candidate:', url);
      const res = await fetch(url);
      if (res.ok) {
        const buffer = Buffer.from(await res.arrayBuffer());
        if (buffer.length > 50000) {
          fs.writeFileSync(path.resolve('public/assets/gatsby-toast.gif'), buffer);
          console.log('Saved from candidate:', url, buffer.length, 'bytes');
          return;
        }
      }
    } catch (e) {
      console.log('Candidate failed:', url, e.message);
    }
  }
}

downloadExactGatsby();
