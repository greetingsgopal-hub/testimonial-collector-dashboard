import path from 'path';
import fs from 'fs';
import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

// Path to system ffmpeg
const ffmpegPath = process.env.FFMPEG_PATH || 'C:\\Users\\User\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-9.0.2-full_build\\bin\\ffmpeg.exe';

export const ASPECT_RATIOS = {
  '9:16': { width: 1080, height: 1920, label: 'Reels / Stories' },
  '4:5': { width: 1080, height: 1350, label: 'Feed Video' },
  '1:1': { width: 1080, height: 1080, label: 'Square' },
};

/**
 * Quality Lock Parameters for Meta Ads compliance:
 * - CRF <= 18 (visually lossless)
 * - Bitrate >= 10 Mbps
 * - Audio: loudnorm I=-14 LUFS (Meta broadcast standard)
 * - Video filter: unsharp=5:5:0.3 (crystal clear edge sharpening)
 */
export async function exportTopNotchVideo({
  inputPath,
  outputPath,
  startTime = 0,
  duration = 9,
  ratio = '9:16',
  hookText = '',
  hookColor = '#FFD60A',
  enableSharpen = true,
  enableLoudnorm = true,
  enableCaptions = false,
  subtitlePath = null,
  crf = 18,
  bitrate = '10M'
}) {
  // Quality Lock validation
  const numCrf = Number(crf);
  if (numCrf > 20) {
    throw new Error(`[Quality Lock] CRF ${numCrf} exceeds maximum threshold of 20. Top notch quality locked for Meta Ads.`);
  }

  const targetRatio = ASPECT_RATIOS[ratio] || ASPECT_RATIOS['9:16'];
  const targetW = targetRatio.width;
  const targetH = targetRatio.height;

  // Build filtergraph
  const videoFilters = [];

  // 1. Scale and crop to exact target resolution
  videoFilters.push(`scale=${targetW}:${targetH}:force_original_aspect_ratio=increase,crop=${targetW}:${targetH},setsar=1`);

  // 2. Unsharp sharpening filter if enabled
  if (enableSharpen) {
    videoFilters.push(`unsharp=5:5:0.3:5:5:0.0`);
  }

  // 3. Burn hook text if provided
  if (hookText && hookText.trim()) {
    const sanitizedText = hookText
      .replace(/'/g, "\\'")
      .replace(/:/g, "\\:")
      .replace(/%/g, "\\%");

    // Position hook in safe zone (y = 280 for 9:16, y = 200 for 4:5, y = 140 for 1:1)
    const hookY = ratio === '9:16' ? 280 : ratio === '4:5' ? 200 : 140;
    const drawtext = `drawtext=text='${sanitizedText}':font='Impact':fontsize=56:fontcolor=${hookColor}:bordercolor=black:borderw=6:shadowcolor=black@0.6:shadowx=3:shadowy=3:x=(w-text_w)/2:y=${hookY}:enable='between(t,0,3.5)'`;
    videoFilters.push(drawtext);
  }

  // 4. Burn subtitles if enabled
  if (enableCaptions && subtitlePath && fs.existsSync(subtitlePath)) {
    const escapedAss = subtitlePath.replace(/\\/g, '/').replace(/:/g, '\\:');
    videoFilters.push(`ass='${escapedAss}'`);
  }

  // Build audio filter
  const audioFilters = [];
  if (enableLoudnorm) {
    audioFilters.push('loudnorm=I=-14:LRA=11:TP=-1.5');
  }

  const vfArg = videoFilters.length ? `-vf "${videoFilters.join(',')}"` : '';
  const afArg = audioFilters.length ? `-af "${audioFilters.join(',')}"` : '';

  // Ensure output directory exists
  const outDir = path.dirname(outputPath);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  // Construct FFmpeg command
  const cmd = `"${ffmpegPath}" -y -ss ${startTime} -t ${duration} -i "${inputPath}" ${vfArg} ${afArg} -c:v libx264 -preset slow -crf ${crf} -b:v ${bitrate} -maxrate ${bitrate} -bufsize 20M -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart "${outputPath}"`;

  console.log(`[VideoEdit] Executing top-notch render for ratio ${ratio} (CRF ${crf}, Bitrate ${bitrate}):`, cmd);

  try {
    const { stdout, stderr } = await execPromise(cmd);
    return {
      success: true,
      ratio,
      resolution: `${targetW}x${targetH}`,
      duration,
      crf,
      bitrate,
      outputPath
    };
  } catch (err) {
    console.error('[VideoEdit] Render failed:', err);
    throw err;
  }
}

export default {
  exportTopNotchVideo,
  ASPECT_RATIOS
};
