import { execSync } from 'child_process';
import path from 'path';

const ffmpegPath = 'C:\\Users\\User\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-9.0.2-full_build\\bin\\ffmpeg.exe';
const inputVideo = 'C:\\Users\\User\\Downloads\\new_reel_TXGloijJM14.mp4';
const outputVideo = path.resolve('public', 'think_reel.mp4');
const subtitlePath = 'scripts/subtitles_viral.ass';

console.log('Rendering viral multi-cut reel with dynamic transitions and 3D Apple emotional emojis...');

// 1. Camera Punch-in Cuts:
const cameraCuts = [
  `[0:v]trim=start=0:end=3.4,setpts=PTS-STARTPTS,crop=w=iw/1.25:h=ih/1.25:x=(iw-iw/1.25)/2:y=ih*0.06,scale=720:1280,setsar=1[v0]`,
  `[0:v]trim=start=3.4:end=11.8,setpts=PTS-STARTPTS,scale=720:1280,setsar=1[v1]`,
  `[0:v]trim=start=11.8:end=16.5,setpts=PTS-STARTPTS,crop=w=iw/1.30:h=ih/1.30:x=(iw-iw/1.30)/2:y=ih*0.28,scale=720:1280,setsar=1[v2]`,
  `[0:v]trim=start=16.5:end=21.0,setpts=PTS-STARTPTS,crop=w=iw/1.12:h=ih/1.12:x=(iw-iw/1.12)/2:y=ih*0.12,scale=720:1280,setsar=1[v3]`,
  `[0:v]trim=start=21.0:end=26.5,setpts=PTS-STARTPTS,crop=w=iw/1.35:h=ih/1.35:x=(iw-iw/1.35)/2:y=ih*0.35,scale=720:1280,setsar=1[v4]`,
  `[0:v]trim=start=26.5:end=34.0,setpts=PTS-STARTPTS,crop=w=iw/1.12:h=ih/1.12:x=(iw-iw/1.12)/2:y=ih*0.10,scale=720:1280,setsar=1[v5]`,
  `[0:v]trim=start=34.0:end=43.0,setpts=PTS-STARTPTS,scale=720:1280,setsar=1[v6]`,
  `[0:v]trim=start=43.0:end=48.0,setpts=PTS-STARTPTS,crop=w=iw/1.25:h=ih/1.25:x=(iw-iw/1.25)/2:y=ih*0.14,scale=720:1280,setsar=1[v7]`,
  `[0:v]trim=start=48.0:end=53.0,setpts=PTS-STARTPTS,scale=720:1280,setsar=1[v8]`,
  `[0:v]trim=start=53.0:end=59.05,setpts=PTS-STARTPTS,crop=w=iw/1.25:h=ih/1.25:x=(iw-iw/1.25)/2:y=ih*0.07,scale=720:1280,setsar=1[v9]`
];

const concatCuts = `[v0][v1][v2][v3][v4][v5][v6][v7][v8][v9]concat=n=10:v=1:a=0[vbase]`;
const flashAndSubs = `[vbase]drawbox=color=white@0.40:t=fill:enable='between(t,3.36,3.46)+between(t,11.74,11.86)+between(t,20.94,21.06)+between(t,26.44,26.56)+between(t,42.94,43.06)+between(t,52.94,53.06)',ass=${subtitlePath}[vsubs]`;

// 2. High-res Apple emoji overlays (scaled to 110x110 and centered above the caption at y=915):
const emojiOverlays = [
  { file: 'mindblown.png', start: 0.3, end: 3.4 },    // 🤯 Shocked: "KURTA MEIN POCKETS?!"
  { file: 'cross.png', start: 3.4, end: 5.4 },        // ❌ Burden: "PURSE CARRY KARNA?"
  { file: 'dancing.png', start: 5.4, end: 7.8 },      // 💃 Joy/Freedom: "NO JHANJHAT AT ALL!"
  { file: 'chefkiss.png', start: 7.8, end: 10.0 },    // 🤌 Chill: "DON'T WORRY..."
  { file: 'lightbulb.png', start: 10.0, end: 12.5 },  // 💡 Eureka: "PROBLEM SOLVED!"
  { file: 'phone.png', start: 12.5, end: 17.0 },      // 📱 Tech/Utility: "DEEP POCKETS FOR PHONE!"
  { file: 'cloud.png', start: 17.0, end: 21.8 },      // ☁️ Soft: "SUPER COMFORTABLE FABRIC!"
  { file: 'fire.png', start: 21.8, end: 27.2 },       // 🔥 Lit: "CRAZY 4-WAY STRETCH!"
  { file: 'chefkiss.png', start: 27.2, end: 33.5 },   // 🤌 Perfect: "FITS LIKE A GLOVE!"
  { file: 'palette.png', start: 33.5, end: 40.0 },    // 🎨 Variety: "TRENDING COLORS!"
  { file: 'crown.png', start: 40.0, end: 43.5 },      // 👑 Inclusive: "PLUS SIZES AVAILABLE!"
  { file: 'hundred.png', start: 43.5, end: 50.0 },    // 💯 Trust: "100% FREE SIZE EXCHANGE!"
  { file: 'factory.png', start: 50.0, end: 53.5 },    // 🏭 Maker: "DIRECT FROM FACTORY!"
  { file: 'rocket.png', start: 53.5, end: 59.05 }     // 🚀 Speed: "TAP LINK & ORDER NOW!"
];

// Build input flags
const emojiInputs = emojiOverlays.map(e => `-i "scripts/emojis/${e.file}"`).join(' ');

// Build overlay filter graph
let currentStream = 'vsubs';
const overlayFilters = [];

emojiOverlays.forEach((e, idx) => {
  const inIdx = idx + 1; // 0 is video
  const outStream = idx === emojiOverlays.length - 1 ? 'vfinal' : `vem_${idx}`;
  overlayFilters.push(`[${inIdx}:v]scale=115:115[em_${idx}]`);
  overlayFilters.push(`[${currentStream}][em_${idx}]overlay=x=(W-w)/2:y=910:enable='between(t,${e.start},${e.end})'[${outStream}]`);
  currentStream = outStream;
});

// Audio mastering
const audioFilter = `[0:a]speechnorm=e=4:r=0.0001:l=1,highpass=f=80,equalizer=f=3200:t=q:w=1.5:g=3.5[afinal]`;

const allFilters = [
  ...cameraCuts,
  concatCuts,
  flashAndSubs,
  ...overlayFilters,
  audioFilter
].join(';');

const cmd = `"${ffmpegPath}" -y -i "${inputVideo}" ${emojiInputs} -filter_complex "${allFilters}" -map "[vfinal]" -map "[afinal]" -c:v libx264 -profile:v high -level 4.0 -r 25 -preset fast -crf 23 -g 50 -keyint_min 25 -pix_fmt yuv420p -c:a aac -b:a 128k -movflags +faststart "${outputVideo}"`;

console.log('Rendering full viral video with expressive Apple 3D emojis...');
try {
  execSync(cmd, { stdio: 'inherit' });
  console.log('Master viral render completed successfully!');
} catch (err) {
  console.error('Render failed:', err);
  process.exit(1);
}
