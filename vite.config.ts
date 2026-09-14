import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

function netlifyFunctionsPlugin(): Plugin {
  const handleApi = async (req: any, res: any, next: any) => {
    if (!req.url?.startsWith('/api/') && !req.url?.startsWith('/.netlify/functions/')) return next();

    const pathname = req.url.split('?')[0].replace('/.netlify/functions/', '').replace('/api/', '');
    const searchParams = new URL(req.url, 'http://localhost').searchParams;
    const query = Object.fromEntries(searchParams.entries());

    let body = '';
    if (['POST', 'PUT', 'PATCH'].includes(req.method || '')) {
      for await (const chunk of req) {
        body += chunk;
      }
    }

    const event = {
      httpMethod: req.method,
      queryStringParameters: query,
      headers: req.headers,
      body,
    };

    try {
      let handlerModule: any;
      if (pathname === 'oauth-init') {
        handlerModule = await import('./netlify/functions/oauth-init');
      } else if (pathname === 'oauth-callback') {
        handlerModule = await import('./netlify/functions/oauth-callback');
      } else if (pathname === 'social-publish') {
        handlerModule = await import('./netlify/functions/social-publish');
      } else if (pathname === 'social-disconnect') {
        handlerModule = await import('./netlify/functions/social-disconnect');
      } else if (pathname === 'social-status') {
        handlerModule = await import('./netlify/functions/social-status');
      }

      if (handlerModule?.handler) {
        const result = await handlerModule.handler(event, {} as any);
        res.statusCode = result.statusCode || 200;
        if (result.headers) {
          for (const [k, v] of Object.entries(result.headers)) {
            res.setHeader(k, v);
          }
        }
        res.end(result.body || '');
        return;
      }
    } catch (err: any) {
      console.error(`[LocalFunction] Error running /api/${pathname}:`, err);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: err.message }));
      return;
    }
    next();
  };

  return {
    name: 'netlify-functions-middleware',
    configureServer(server) {
      server.middlewares.use(handleApi);
    },
    configurePreviewServer(server) {
      server.middlewares.use(handleApi);
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), netlifyFunctionsPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  esbuild: {
    drop: ['debugger'],
  },
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          // Firebase SDK is large (~600KB); isolate it so it can be cached independently
          'firebase-core': ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage'],
          // React/React-DOM are stable and benefit from long cache lives
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
});
