import { createServer } from 'node:http';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawn } from 'node:child_process';

const PORT = Number(process.env.PORT || 8080);
const MAX_BYTES = 100 * 1024 * 1024;
const FORMATS = {
  '9x16': { width: 1080, height: 1920, bitrate: '10M' },
  '4x5': { width: 1080, height: 1350, bitrate: '8M' },
  '1x1': { width: 1080, height: 1080, bitrate: '8M' },
};
const jobs = new Map();

const server = createServer(async (req, res) => {
  const url = new URL(req.url || '/', 'http://localhost');
  if (req.method === 'GET' && url.pathname === '/health') {
    res.writeHead(200, { 'content-type': 'text/plain' }).end('ok');
    return;
  }

  const renderId = url.searchParams.get('renderId') || '';
  if (!/^[0-9a-f-]{36}$/i.test(renderId)) {
    res.writeHead(400).end('Invalid render ID.');
    return;
  }

  if (url.pathname === '/prepare' && req.method === 'DELETE') {
    const dir = jobs.get(renderId);
    if (dir) await rm(dir, { recursive: true, force: true });
    jobs.delete(renderId);
    res.writeHead(204).end();
    return;
  }

  if (url.pathname === '/prepare' && req.method === 'POST') {
    const dir = await mkdtemp(join(tmpdir(), 'pandapraise-'));
    try {
      const chunks = [];
      let totalBytes = 0;
      for await (const chunk of req) {
        totalBytes += chunk.length;
        if (totalBytes > MAX_BYTES) {
          await rm(dir, { recursive: true, force: true });
          res.writeHead(413).end('Video exceeds the 100 MB limit.');
          return;
        }
        chunks.push(chunk);
      }
      if (!totalBytes) {
        await rm(dir, { recursive: true, force: true });
        res.writeHead(400).end('Video body is required.');
        return;
      }
      await writeFile(join(dir, 'input.mp4'), Buffer.concat(chunks));
      const previous = jobs.get(renderId);
      if (previous) await rm(previous, { recursive: true, force: true });
      jobs.set(renderId, dir);
      res.writeHead(201, { 'content-type': 'application/json' }).end(JSON.stringify({ ok: true }));
    } catch (error) {
      await rm(dir, { recursive: true, force: true });
      console.error(JSON.stringify({ event: 'renderer.prepare_failure', name: error?.name || 'Error' }));
      if (!res.headersSent) res.writeHead(500).end('Could not prepare the source video.');
    }
    return;
  }

  if (url.pathname !== '/render' || req.method !== 'POST') {
    res.writeHead(404).end();
    return;
  }
  const format = FORMATS[url.searchParams.get('ratio') || ''];
  const dir = jobs.get(renderId);
  if (!format) {
    res.writeHead(400, { 'content-type': 'application/json' }).end(JSON.stringify({ error: 'Unsupported ratio.' }));
    return;
  }
  if (!dir) {
    res.writeHead(404, { 'content-type': 'application/json' }).end(JSON.stringify({ error: 'Prepared source video was not found.' }));
    return;
  }

  const inputPath = join(dir, 'input.mp4');
  const outputPath = join(dir, `${url.searchParams.get('ratio')}.mp4`);
  try {
    const probe = await run('ffprobe', ['-v', 'error', '-select_streams', 'a:0', '-show_entries', 'stream=index', '-of', 'csv=p=0', inputPath]);
    const hasAudio = probe.stdout.trim().length > 0;
    const filter = `scale=${format.width}:${format.height}:force_original_aspect_ratio=increase,crop=${format.width}:${format.height},setsar=1,unsharp=3:3:0.3`;
    const args = [
      '-hide_banner', '-loglevel', 'error', '-y', '-i', inputPath,
      '-map', '0:v:0', '-map', '0:a:0?',
      '-vf', filter,
      '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-b:v', format.bitrate,
      '-maxrate', format.bitrate, '-bufsize', `${Number.parseInt(format.bitrate, 10) * 2}M`,
      '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
    ];
    if (hasAudio) args.push('-af', 'loudnorm=I=-14:TP=-1.5:LRA=11', '-c:a', 'aac', '-b:a', '192k');
    else args.push('-an');
    args.push(outputPath);
    await run('ffmpeg', args);

    const probeResult = await run('ffprobe', [
      '-v', 'error', '-select_streams', 'v:0',
      '-show_entries', 'stream=bit_rate,width,height', '-of', 'json', outputPath,
    ]);
    const videoStream = JSON.parse(probeResult.stdout).streams?.[0];
    const videoBitrate = Number(videoStream?.bit_rate);
    if (!Number.isFinite(videoBitrate) || videoBitrate < 6_000_000) {
      res.writeHead(422, { 'content-type': 'application/json' }).end(JSON.stringify({ error: 'Video bitrate is below the 6 Mbps quality threshold.' }));
      return;
    }

    const output = await readFile(outputPath);
    if (output.byteLength > MAX_BYTES) {
      res.writeHead(413, { 'content-type': 'application/json' }).end(JSON.stringify({ error: 'Output exceeds the 100 MB render limit.' }));
      return;
    }
    res.writeHead(200, {
      'content-type': 'video/mp4',
      'content-length': String(output.byteLength),
      'cache-control': 'no-store',
      'x-video-width': String(format.width),
      'x-video-height': String(format.height),
      'x-video-bitrate': String(videoBitrate),
    }).end(output);
  } catch (error) {
    // FFmpeg errors can contain source paths; return a generic error and keep
    // source media and personal data out of container logs.
    console.error(JSON.stringify({ event: 'renderer.failure', name: error?.name || 'Error' }));
    if (!res.headersSent) res.writeHead(422, { 'content-type': 'application/json' }).end(JSON.stringify({ error: 'FFmpeg could not render this video.' }));
    else res.destroy();
  }
});

server.requestTimeout = 10 * 60 * 1000;
server.headersTimeout = 10 * 60 * 1000;
server.listen(PORT, '0.0.0.0');

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: ['ignore', 'pipe', 'ignore'] });
    const stdout = [];
    child.stdout.on('data', (chunk) => stdout.push(chunk));
    child.on('error', reject);
    child.on('close', (code) => code === 0
      ? resolve({ stdout: Buffer.concat(stdout).toString('utf8') })
      : reject(new Error(`${command} exited with ${code}`)));
  });
}
