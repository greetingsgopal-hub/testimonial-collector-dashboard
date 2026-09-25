import fs from 'fs';
import path from 'path';

async function testGiphyGatsbyCandidates() {
  const ids = [
    'qxPZt9jKqE9yH8LwQz',
    'GCLlQnV7dXY2KGmpBR',
    '8Iv5lqKwKsZ2g',
    '111ebonMs90YLu',
    'rD62fdKGwIg0g',
    'mvyvX8LWoDQN2'
  ];

  for (const id of ids) {
    try {
      const pageRes = await fetch(`https://giphy.com/gifs/${id}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      const html = await pageRes.text();
      const title = html.match(/<title>([^<]+)<\/title>/i)?.[1];
      const gifUrl = html.match(/https:\/\/media[0-9]*\.giphy\.com\/media\/[a-zA-Z0-9_-]+\/giphy\.gif/i)?.[0];
      console.log(`ID ${id}: Title = "${title}", GIF URL = ${gifUrl}`);
    } catch (e) {
      console.log(`ID ${id} error:`, e.message);
    }
  }
}

testGiphyGatsbyCandidates();
