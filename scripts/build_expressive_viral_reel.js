import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const ffmpegPath = 'C:\\Users\\User\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-9.0.2-full_build\\bin\\ffmpeg.exe';
const inputVideo = 'C:\\Users\\User\\Downloads\\new_reel_TXGloijJM14.mp4';
const outputVideo = path.resolve('public', 'think_reel.mp4');
const assPath = 'scripts/subtitles_expressive.ass';

// The 15 emotional subtitle bursts across the 59s reel:
// Font size: 42 in ASS (PlayRes 720x1280).
// Each subtitle line is paired with a vivid Apple 3D emoji at the end of the sentence.
const subtitles = [
  // 0-3.4s: Hook
  {
    start: 0.3,
    end: 1.8,
    text: 'WOW YAAR!',
    style: 'CapCutPop',
    color: '&H00FFFFFF&',
    emoji: 'mindblown.png',
    width: 175,
    tStart: '0:00:00.30',
    tEnd: '0:00:01.80'
  },
  {
    start: 1.8,
    end: 3.4,
    text: 'KURTA MEIN POCKETS?!',
    style: 'CapCutYellow',
    color: '&H0000E6FF&',
    emoji: 'mindblown.png',
    width: 360,
    tStart: '0:00:01.80',
    tEnd: '0:00:03.40'
  },

  // 3.4-7.8s: Purse hassle vs freedom
  {
    start: 3.4,
    end: 5.4,
    text: 'PURSE CARRY KARNA?',
    style: 'CapCutRed',
    color: '&H003322FF&',
    emoji: 'weary.png',
    width: 340,
    tStart: '0:00:03.40',
    tEnd: '0:00:05.40'
  },
  {
    start: 5.4,
    end: 7.8,
    text: 'NO JHANJHAT AT ALL!',
    style: 'CapCutGreen',
    color: '&H0044FF00&',
    emoji: 'dancing.png',
    width: 310,
    tStart: '0:00:05.40',
    tEnd: '0:00:07.80'
  },

  // 7.8-12.5s: Reassurance & problem solved
  {
    start: 7.8,
    end: 10.0,
    text: "DON'T WORRY...",
    style: 'CapCutPop',
    color: '&H00FFFFFF&',
    emoji: 'wink.png',
    width: 235,
    tStart: '0:00:07.80',
    tEnd: '0:00:10.00'
  },
  {
    start: 10.0,
    end: 12.5,
    text: 'PROBLEM SOLVED!',
    style: 'CapCutYellow',
    color: '&H0000E6FF&',
    emoji: 'lightbulb.png',
    width: 280,
    tStart: '0:00:10.00',
    tEnd: '0:00:12.50'
  },

  // 12.5-17.0s: Deep pockets for phone & essentials
  {
    start: 12.5,
    end: 14.6,
    text: 'DEEP POCKETS FOR',
    style: 'CapCutPop',
    color: '&H00FFFFFF&',
    emoji: null, // continuation line
    width: 290,
    tStart: '0:00:12.50',
    tEnd: '0:00:14.60'
  },
  {
    start: 14.6,
    end: 17.0,
    text: 'PHONE + KEYS + CASH!',
    style: 'CapCutYellow',
    color: '&H0000E6FF&',
    emoji: 'phone.png',
    width: 340,
    tStart: '0:00:14.60',
    tEnd: '0:00:17.00'
  },

  // 17.0-21.8s: Super comfortable fabric
  {
    start: 17.0,
    end: 19.4,
    text: 'SUPER COMFORTABLE',
    style: 'CapCutPop',
    color: '&H00FFFFFF&',
    emoji: null,
    width: 330,
    tStart: '0:00:17.00',
    tEnd: '0:00:19.40'
  },
  {
    start: 19.4,
    end: 21.8,
    text: 'PREMIUM FABRIC!',
    style: 'CapCutPop',
    color: '&H00FFFFFF&',
    emoji: 'hearts.png',
    width: 275,
    tStart: '0:00:19.40',
    tEnd: '0:00:21.80'
  },

  // 21.8-27.2s: 4-Way Stretch
  {
    start: 21.8,
    end: 24.0,
    text: 'JUST SEE THIS...',
    style: 'CapCutPop',
    color: '&H00FFFFFF&',
    emoji: null,
    width: 235,
    tStart: '0:00:21.80',
    tEnd: '0:00:24.00'
  },
  {
    start: 24.0,
    end: 27.2,
    text: 'CRAZY 4-WAY STRETCH!',
    style: 'CapCutYellow',
    color: '&H0000E6FF&',
    emoji: 'fire.png',
    width: 360,
    tStart: '0:00:24.00',
    tEnd: '0:00:27.20'
  },

  // 27.2-33.5s: Fit & Silhouette
  {
    start: 27.2,
    end: 30.2,
    text: 'FITS LIKE A GLOVE!',
    style: 'CapCutGreen',
    color: '&H0044FF00&',
    emoji: 'hearteyes.png',
    width: 280,
    tStart: '0:00:27.20',
    tEnd: '0:00:30.20'
  },
  {
    start: 30.2,
    end: 33.5,
    text: 'PERFECT SLEEVE LENGTH!',
    style: 'CapCutPop',
    color: '&H00FFFFFF&',
    emoji: 'chefkiss.png',
    width: 375,
    tStart: '0:00:30.20',
    tEnd: '0:00:33.50'
  },

  // 33.5-40.0s: Trending colors
  {
    start: 33.5,
    end: 36.5,
    text: 'SO CLASSY & TRENDING!',
    style: 'CapCutPop',
    color: '&H00FFFFFF&',
    emoji: 'sparkles.png',
    width: 370,
    tStart: '0:00:33.50',
    tEnd: '0:00:36.50'
  },
  {
    start: 36.5,
    end: 40.0,
    text: 'TRENDING COLORS IN STOCK!',
    style: 'CapCutYellow',
    color: '&H0000E6FF&',
    emoji: 'palette.png',
    width: 440,
    tStart: '0:00:36.50',
    tEnd: '0:00:40.00'
  },

  // 40.0-43.5s: Plus sizes
  {
    start: 40.0,
    end: 43.5,
    text: 'PLUS SIZES AVAILABLE TOO!',
    style: 'CapCutPop',
    color: '&H00FFFFFF&',
    emoji: 'crown.png',
    width: 410,
    tStart: '0:00:40.00',
    tEnd: '0:00:43.50'
  },

  // 43.5-50.0s: 100% Free exchange
  {
    start: 43.5,
    end: 47.0,
    text: '100% FREE SIZE EXCHANGE!',
    style: 'CapCutGreen',
    color: '&H0044FF00&',
    emoji: 'hundred.png',
    width: 410,
    tStart: '0:00:43.50',
    tEnd: '0:00:47.00'
  },
  {
    start: 47.0,
    end: 50.0,
    text: 'WRONG SIZE? NO PROBLEM!',
    style: 'CapCutPop',
    color: '&H00FFFFFF&',
    emoji: 'sparkles.png',
    width: 420,
    tStart: '0:00:47.00',
    tEnd: '0:00:50.00'
  },

  // 50.0-53.5s: Direct factory
  {
    start: 50.0,
    end: 53.5,
    text: 'DIRECT FROM FACTORY!',
    style: 'CapCutYellow',
    color: '&H0000E6FF&',
    emoji: 'money.png',
    width: 360,
    tStart: '0:00:50.00',
    tEnd: '0:00:53.50'
  },

  // 53.5-58.8s: Call to action
  {
    start: 53.5,
    end: 58.8,
    text: 'TAP LINK & ORDER NOW!',
    style: 'CapCutYellow',
    color: '&H0000E6FF&',
    emoji: 'rocket.png',
    width: 365,
    tStart: '0:00:53.50',
    tEnd: '0:00:58.80'
  }
];

// Emoji dimension
const EMOJI_SIZE = 58;
const EMOJI_GAP = 10;
const Y_BASELINE = 1070; // baseline of text at MarginV=210

// Generate ASS content with exact positioning
const assHeader = `[Script Info]
Title: PandaPraise Viral Subtitles with Expressive End-of-Sentence Emojis
ScriptType: v4.00+
PlayResX: 720
PlayResY: 1280
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: ViralHook,Impact,44,&H00000000,&H00000000,&H0000E6FF,&H90000000,-1,0,0,0,100,100,1,0,3,14,0,8,20,20,100,1
Style: CapCutPop,Impact,42,&H00FFFFFF,&H00000000,&H00000000,&H90000000,-1,0,0,0,100,100,1.2,0,1,6,3,2,30,30,210,1
Style: CapCutYellow,Impact,42,&H0000E6FF,&H00000000,&H00000000,&H90000000,-1,0,0,0,100,100,1.2,0,1,6,3,2,30,30,210,1
Style: CapCutGreen,Impact,42,&H0044FF00,&H00000000,&H00000000,&H90000000,-1,0,0,0,100,100,1.2,0,1,6,3,2,30,30,210,1
Style: CapCutRed,Impact,42,&H003322FF,&H00000000,&H00000000,&H90000000,-1,0,0,0,100,100,1.2,0,1,6,3,2,30,30,210,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
; Sticky Hook Banner at top
Dialogue: 2,0:00:00.00,0:00:03.20,ViralHook,,0,0,0,,{\\an8\\t(0,100,\\fscx110\\fscy110)\\t(100,200,\\fscx100\\fscy100)\\bord14\\c&H00000000&\\3c&H0000E6FF&}POV: KURTA MEIN REAL POCKETS?!
`;

const assDialogues = [];
const emojiOverlays = [];

subtitles.forEach((s) => {
  if (s.emoji) {
    // Has emoji at end: shift text center slightly left so (text + emoji) is perfectly centered
    const groupOffset = Math.round((EMOJI_SIZE + EMOJI_GAP) / 2); // ~34px
    const textCenterX = 360 - groupOffset;
    const textRightX = textCenterX + Math.round(s.width / 2);
    const emojiX = textRightX + EMOJI_GAP;
    const emojiY = Y_BASELINE - EMOJI_SIZE - 2;

    assDialogues.push(
      `Dialogue: 1,${s.tStart},${s.tEnd},${s.style},,0,0,0,,{\\pos(${textCenterX},${Y_BASELINE})\\c${s.color}\\t(0,70,\\fscx120\\fscy120)\\t(70,140,\\fscx100\\fscy100)}${s.text}`
    );

    emojiOverlays.push({
      file: s.emoji,
      start: s.start,
      end: s.end,
      x: emojiX,
      y: emojiY
    });
  } else {
    // No emoji: regular center
    assDialogues.push(
      `Dialogue: 1,${s.tStart},${s.tEnd},${s.style},,0,0,0,,{\\pos(360,${Y_BASELINE})\\c${s.color}\\t(0,70,\\fscx120\\fscy120)\\t(70,140,\\fscx100\\fscy100)}${s.text}`
    );
  }
});

fs.writeFileSync(assPath, assHeader + assDialogues.join('\n') + '\n');
console.log('Generated expressive ASS subtitle file:', assPath);

// Camera Punch-In Cuts
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
const flashAndSubs = `[vbase]drawbox=color=white@0.40:t=fill:enable='between(t,3.36,3.46)+between(t,11.74,11.86)+between(t,20.94,21.06)+between(t,26.44,26.56)+between(t,42.94,43.06)+between(t,52.94,53.06)',ass=${assPath}[vsubs]`;

// Input flags for each emoji overlay
const emojiInputs = emojiOverlays.map(e => `-i "scripts/emojis/${e.file}"`).join(' ');

// Build overlay filter graph
let currentStream = 'vsubs';
const overlayFilters = [];

emojiOverlays.forEach((e, idx) => {
  const inIdx = idx + 1; // 0 is base video
  const outStream = idx === emojiOverlays.length - 1 ? 'vfinal' : `vem_${idx}`;
  overlayFilters.push(`[${inIdx}:v]scale=${EMOJI_SIZE}:${EMOJI_SIZE}[em_${idx}]`);
  overlayFilters.push(
    `[${currentStream}][em_${idx}]overlay=x=${e.x}:y=${e.y}:enable='between(t,${e.start},${e.end})'[${outStream}]`
  );
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

console.log('Rendering master viral reel with expressive Apple 3D emojis at the end of each sentence...');
try {
  execSync(cmd, { stdio: 'inherit' });
  console.log('Render complete! Saved to:', outputVideo);
} catch (err) {
  console.error('Render failed:', err);
  process.exit(1);
}
