import { execSync } from 'child_process';
import path from 'path';

const ffmpegPath = 'C:\\Users\\User\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-9.0.2-full_build\\bin\\ffmpeg.exe';
const inputVideo = 'C:\\Users\\User\\Downloads\\new_reel_TXGloijJM14.mp4';
const outputVideo = path.resolve('public', 'think_reel.mp4');
const subtitlePath = 'scripts/subtitles_viral.ass';

console.log('Rendering viral multi-cut reel with dynamic punch-in camera transitions and kinetic subtitles...');

// Define the 10 camera cuts with punch-ins on key moments:
const filterComplex = [
  // Cut 0: Hook punch zoom 1.25x on upper body & face (0.0s - 3.4s)
  `[0:v]trim=start=0:end=3.4,setpts=PTS-STARTPTS,crop=w=iw/1.25:h=ih/1.25:x=(iw-iw/1.25)/2:y=ih*0.06,scale=720:1280,setsar=1[v0]`,
  // Cut 1: Wide shot 1.0x (3.4s - 11.8s)
  `[0:v]trim=start=3.4:end=11.8,setpts=PTS-STARTPTS,scale=720:1280,setsar=1[v1]`,
  // Cut 2: Pocket demonstration punch zoom 1.30x on waist/hands (11.8s - 16.5s)
  `[0:v]trim=start=11.8:end=16.5,setpts=PTS-STARTPTS,crop=w=iw/1.30:h=ih/1.30:x=(iw-iw/1.30)/2:y=ih*0.28,scale=720:1280,setsar=1[v2]`,
  // Cut 3: Medium shot 1.12x (16.5s - 21.0s)
  `[0:v]trim=start=16.5:end=21.0,setpts=PTS-STARTPTS,crop=w=iw/1.12:h=ih/1.12:x=(iw-iw/1.12)/2:y=ih*0.12,scale=720:1280,setsar=1[v3]`,
  // Cut 4: Stretch test punch zoom 1.35x on hands stretching fabric (21.0s - 26.5s)
  `[0:v]trim=start=21.0:end=26.5,setpts=PTS-STARTPTS,crop=w=iw/1.35:h=ih/1.35:x=(iw-iw/1.35)/2:y=ih*0.35,scale=720:1280,setsar=1[v4]`,
  // Cut 5: Fit and sleeves medium shot 1.12x (26.5s - 34.0s)
  `[0:v]trim=start=26.5:end=34.0,setpts=PTS-STARTPTS,crop=w=iw/1.12:h=ih/1.12:x=(iw-iw/1.12)/2:y=ih*0.10,scale=720:1280,setsar=1[v5]`,
  // Cut 6: Wide shot 1.0x (34.0s - 43.0s)
  `[0:v]trim=start=34.0:end=43.0,setpts=PTS-STARTPTS,scale=720:1280,setsar=1[v6]`,
  // Cut 7: Size exchange punch zoom 1.25x (43.0s - 48.0s)
  `[0:v]trim=start=43.0:end=48.0,setpts=PTS-STARTPTS,crop=w=iw/1.25:h=ih/1.25:x=(iw-iw/1.25)/2:y=ih*0.14,scale=720:1280,setsar=1[v7]`,
  // Cut 8: Wide shot 1.0x factory talk (48.0s - 53.0s)
  `[0:v]trim=start=48.0:end=53.0,setpts=PTS-STARTPTS,scale=720:1280,setsar=1[v8]`,
  // Cut 9: Final Call To Action punch zoom 1.25x on face (53.0s - 59.05s)
  `[0:v]trim=start=53.0:end=59.05,setpts=PTS-STARTPTS,crop=w=iw/1.25:h=ih/1.25:x=(iw-iw/1.25)/2:y=ih*0.07,scale=720:1280,setsar=1[v9]`,

  // Concat all 10 video cuts
  `[v0][v1][v2][v3][v4][v5][v6][v7][v8][v9]concat=n=10:v=1:a=0[vraw]`,

  // Add CapCut white flash transition pulses at each cut point + kinetic ASS subtitles
  `[vraw]drawbox=color=white@0.40:t=fill:enable='between(t,3.36,3.46)+between(t,11.74,11.86)+between(t,20.94,21.06)+between(t,26.44,26.56)+between(t,42.94,43.06)+between(t,52.94,53.06)',ass=${subtitlePath}[vfinal]`,

  // Audio broadcast mastering: speech normalization, highpass, and vocal presence boost
  `[0:a]speechnorm=e=4:r=0.0001:l=1,highpass=f=80,equalizer=f=3200:t=q:w=1.5:g=3.5[afinal]`
].join(';');

const cmd = `"${ffmpegPath}" -y -i "${inputVideo}" -filter_complex "${filterComplex}" -map "[vfinal]" -map "[afinal]" -c:v libx264 -profile:v high -level 4.0 -r 25 -preset fast -crf 23 -g 50 -keyint_min 25 -pix_fmt yuv420p -c:a aac -b:a 128k -movflags +faststart "${outputVideo}"`;

console.log('Executing FFmpeg command...');
try {
  execSync(cmd, { stdio: 'inherit' });
  console.log('Viral reel render completed successfully!');
} catch (err) {
  console.error('Render failed:', err);
  process.exit(1);
}
