import fs from 'fs';
import path from 'path';
import https from 'https';

const emojiDir = path.resolve('scripts', 'emojis');

const emojis = [
  { name: 'mindblown', code: '1f92f' },      // 🤯
  { name: 'weary', code: '1f629' },          // 😩
  { name: 'dancing', code: '1f483' },        // 💃
  { name: 'wink', code: '1f609' },           // 😉
  { name: 'lightbulb', code: '1f4a1' },      // 💡
  { name: 'phone', code: '1f4f1' },          // 📱
  { name: 'hearts', code: '1f970' },         // 🥰
  { name: 'fire', code: '1f525' },           // 🔥
  { name: 'hearteyes', code: '1f60d' },      // 😍
  { name: 'chefkiss', code: '1f90c' },       // 🤌
  { name: 'sparkles', code: '2728' },        // ✨
  { name: 'palette', code: '1f3a8' },        // 🎨
  { name: 'crown', code: '1f451' },          // 👑
  { name: 'hundred', code: '1f4af' },        // 💯
  { name: 'money', code: '1f911' },          // 🤑
  { name: 'rocket', code: '1f680' },         // 🚀
  { name: 'cloud', code: '2601-fe0f' },      // ☁️
  { name: 'screaming', code: '1f631' }       // 😱
];

function downloadOne(name, code) {
  const dest = path.join(emojiDir, `${name}.png`);
  if (fs.existsSync(dest) && fs.statSync(dest).size > 1000) {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    const url = `https://raw.githubusercontent.com/iamcal/emoji-data/master/img-apple-160/${code}.png`;
    https.get(url, (res) => {
      if (res.statusCode === 200) {
        const file = fs.createWriteStream(dest);
        res.pipe(file);
        file.on('finish', () => { file.close(); console.log(`✓ ${name}`); resolve(); });
      } else {
        const altCode = code.replace('-fe0f', '');
        https.get(`https://raw.githubusercontent.com/iamcal/emoji-data/master/img-apple-160/${altCode}.png`, (r2) => {
          if (r2.statusCode === 200) {
            const file = fs.createWriteStream(dest);
            r2.pipe(file);
            file.on('finish', () => { file.close(); console.log(`✓ ${name} (alt)`); resolve(); });
          } else {
            console.error(`✗ ${name}`);
            resolve();
          }
        });
      }
    }).on('error', () => resolve());
  });
}

Promise.all(emojis.map(e => downloadOne(e.name, e.code))).then(() => {
  console.log('All downloads finished!');
});
