import fs from 'fs';

async function check(url, name) {
  const html = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }).then(r => r.text());
  
  // Extract og:image, contentUrl, and media.tenor.com URLs
  const ogImage = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i)?.[1];
  const twitterImage = html.match(/<meta\s+name="twitter:image"\s+content="([^"]+)"/i)?.[1];
  const allGifs = [...html.matchAll(/https:\/\/media\.tenor\.com\/[^"'\s]+\.gif/g)].map(m => m[0]);
  
  console.log(`=== ${name} ===`);
  console.log('og:image:', ogImage);
  console.log('twitter:image:', twitterImage);
  console.log('All GIF URLs found:', allGifs);
}

async function run() {
  await check('https://tenor.com/view/this-is-fine-gif-12307212', 'This Is Fine');
  await check('https://tenor.com/view/leonardo-di-caprio-great-gatsby-cheers-celebrate-gif-5645497', 'Gatsby Toast');
}

run();
