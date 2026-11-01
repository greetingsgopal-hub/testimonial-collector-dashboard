import { DurableObject } from 'cloudflare:workers';
import { WorkerEnv } from './types';

/** Internal-only bridge from the authenticated Worker to the FFmpeg service. */
export class VideoRendererContainer extends DurableObject<WorkerEnv> {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const renderId = url.searchParams.get('renderId') || '';
    const isPrepare = url.pathname === '/prepare' && ['POST', 'DELETE'].includes(request.method);
    const isRender = url.pathname === '/render' && request.method === 'POST';
    if (!isPrepare && !isRender) return new Response('Not found', { status: 404 });
    if (!/^[0-9a-f-]{36}$/i.test(renderId)) return new Response('Invalid render ID.', { status: 400 });
    if (isPrepare && request.method === 'POST') {
      const contentLength = Number(request.headers.get('content-length') || 0);
      if (contentLength > 100 * 1024 * 1024) return new Response('Video exceeds the 100 MB render limit.', { status: 413 });
    }
    const ratio = url.searchParams.get('ratio');
    if (isRender && !['9x16', '4x5', '1x1'].includes(ratio || '')) {
      return new Response('Unsupported output ratio.', { status: 400 });
    }

    const container = this.ctx.container;
    if (!container) return new Response('Renderer container is unavailable.', { status: 503 });
    if (!container.running) container.start();
    const port = container.getTcpPort(8080);
    const readyBy = Date.now() + 60_000;
    let ready = false;
    while (Date.now() < readyBy) {
      try {
        const health = await port.fetch('http://renderer:8080/health');
        if (health.ok) {
          ready = true;
          break;
        }
      } catch {
        // The listener may not be accepting connections while the container boots.
      }
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
    if (!ready) return new Response('Renderer container did not become ready.', { status: 503 });

    const upstream = new Request(`http://renderer:8080${url.pathname}${url.search}`, {
      method: request.method,
      headers: request.headers,
      body: request.body,
      // Request streams are forwarded directly; avoid buffering video in the DO.
      // @ts-expect-error Workers supports duplex for streaming request bodies.
      duplex: 'half',
    });
    return port.fetch(upstream);
  }
}
