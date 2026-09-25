import fs from 'fs';
import path from 'path';

async function findExactGatsbyToast() {
  const pageUrl = 'https://tenor.com/view/leonardo-di-caprio-great-gatsby-cheers-celebrate-gif-5645497';
  const res = await fetch(pageUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  });
  const html = await res.text();
  
  // Look for the main media link or json-ld or meta tag
  const scriptTags = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)].map(m => m[1]);
  for (const s of scriptTags) {
    if (s.includes('5645497') || s.includes('cheers') || s.includes('contentUrl')) {
      console.log('Found matching script block with json info:');
      const matches = [...s.matchAll(/https:\/\/media\.tenor\.com\/[^"'\s\\]+/g)].map(m => m[0]);
      console.log(matches);
    }
  }

  // Also check direct Tenor API or web search for the exact Gatsby champagne toast GIF
  const ogVideo = html.match(/<meta\s+property="og:video"[^>]+content="([^"]+)"/i)?.[1];
  const ogImage = html.match(/<meta\s+property="og:image"[^>]+content="([^"]+)"/i)?.[1];
  console.log('og:video:', ogVideo);
  console.log('og:image:', ogImage);
}

findExactGatsbyToast();
