import { WorkerEnv } from '../types';
import { getCorsHeaders } from '../lib/cors';

export function generateOpenApiSpec(origin: string = 'https://pandapraise.com') {
  return {
    openapi: '3.0.3',
    info: {
      title: 'PandaPraise Public REST API',
      version: '1.0.0',
      description: 'Programmatic API to query testimonials, submit new reviews, and manage embeddable widgets for your workspaces.',
      contact: {
        name: 'PandaPraise Developer Support',
        url: `${origin}/developers`,
        email: 'api@pandapraise.com',
      },
    },
    servers: [
      {
        url: origin,
        description: 'Production Edge API Server',
      },
    ],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'X-Api-Key',
          description: 'Standard PandaPraise API Key (prefix: pp_live_...)',
        },
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'API Key',
        },
      },
      schemas: {
        Testimonial: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'rev_78910' },
            authorName: { type: 'string', example: 'Alex Rivera' },
            authorEmail: { type: 'string', example: 'alex@company.com' },
            authorCompany: { type: 'string', example: 'Acme Inc' },
            rating: { type: 'integer', minimum: 1, maximum: 5, example: 5 },
            text: { type: 'string', example: 'PandaPraise 10x our social proof conversions!' },
            status: { type: 'string', enum: ['approved', 'pending', 'rejected'], example: 'approved' },
            avatarUrl: { type: 'string', example: 'https://images.unsplash.com/...' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    security: [
      { ApiKeyAuth: [] },
      { BearerAuth: [] },
    ],
    paths: {
      '/api/v1/testimonials': {
        get: {
          summary: 'List testimonials',
          description: 'Fetch approved testimonials for a space or workspace with optional filtering.',
          parameters: [
            { name: 'space', in: 'query', schema: { type: 'string' }, description: 'Target space slug' },
            { name: 'rating', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 5 }, description: 'Minimum star rating' },
            { name: 'status', in: 'query', schema: { type: 'string', default: 'approved' } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 20, maximum: 100 } },
            { name: 'offset', in: 'query', schema: { type: 'integer', default: 0 } },
          ],
          responses: {
            200: {
              description: 'List of testimonials',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Testimonial' },
                      },
                      total: { type: 'integer' },
                    },
                  },
                },
              },
            },
            401: { description: 'Missing or invalid API key' },
          },
        },
        post: {
          summary: 'Submit a testimonial programmatically',
          description: 'Submit a new customer review via server-side CRM or custom form.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['authorName', 'text', 'rating'],
                  properties: {
                    authorName: { type: 'string' },
                    authorEmail: { type: 'string' },
                    authorCompany: { type: 'string' },
                    rating: { type: 'integer', minimum: 1, maximum: 5 },
                    text: { type: 'string' },
                    spaceSlug: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'Testimonial created successfully' },
            400: { description: 'Validation error' },
            401: { description: 'Unauthorized' },
          },
        },
      },
      '/api/v1/widgets': {
        get: {
          summary: 'List available widget configurations',
          description: 'Get ready-to-embed widget templates and HTML snippets for a space.',
          parameters: [
            { name: 'space', in: 'query', schema: { type: 'string' } },
          ],
          responses: {
            200: { description: 'Widget configurations' },
            401: { description: 'Unauthorized' },
          },
        },
      },
    },
  };
}

function extractApiKey(request: Request): string | null {
  const authHeader = request.headers.get('Authorization') || '';
  if (authHeader.toLowerCase().startsWith('bearer ')) {
    return authHeader.slice(7).trim();
  }
  const xApiKey = request.headers.get('X-Api-Key');
  if (xApiKey) {
    return xApiKey.trim();
  }
  return null;
}

export async function handlePublicApi(
  request: Request,
  _env: WorkerEnv
): Promise<Response> {
  const corsHeaders = getCorsHeaders(request.headers.get('Origin'));
  const url = new URL(request.url);
  const pathname = url.pathname;
  const origin = url.origin;

  // 1. Unauthenticated route: OpenAPI spec
  if (pathname === '/api/v1/openapi.json') {
    return new Response(JSON.stringify(generateOpenApiSpec(origin), null, 2), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // 2. Authentication check
  const apiKey = extractApiKey(request);
  if (!apiKey || !apiKey.startsWith('pp_live_')) {
    return new Response(
      JSON.stringify({
        error: 'Unauthorized: Missing or invalid API key. Keys must start with pp_live_',
        documentation: `${origin}/developers`,
      }),
      {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  // 3. Route dispatching
  if (pathname === '/api/v1/testimonials') {
    if (request.method === 'GET') {
      const space = url.searchParams.get('space') || 'demo';
      const minRating = parseInt(url.searchParams.get('rating') || '1', 10);
      const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '20', 10)));
      const offset = Math.max(0, parseInt(url.searchParams.get('offset') || '0', 10));

      const sampleReviews = [
        {
          id: 'api_rev_001',
          authorName: 'Alex Rivera',
          authorCompany: 'Rivera Labs',
          rating: 5,
          text: 'PandaPraise doubled our sales conversion on day one.',
          status: 'approved',
          spaceSlug: space,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'api_rev_002',
          authorName: 'Sarah Jenkins',
          authorCompany: 'HyperGrowth',
          rating: 5,
          text: 'The marquee ticker widget embeds flawlessly on Shopify!',
          status: 'approved',
          spaceSlug: space,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ].filter(r => r.rating >= minRating);

      return new Response(
        JSON.stringify({
          data: sampleReviews.slice(offset, offset + limit),
          total: sampleReviews.length,
          limit,
          offset,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (request.method === 'POST') {
      let body: any;
      try {
        body = await request.json();
      } catch {
        return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (!body.authorName || !body.text) {
        return new Response(
          JSON.stringify({ error: 'authorName and text are required fields' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const rating = Math.min(5, Math.max(1, parseInt(body.rating || '5', 10)));
      const newTestimonial = {
        id: `api_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        authorName: String(body.authorName).trim(),
        authorEmail: body.authorEmail ? String(body.authorEmail).trim() : undefined,
        authorCompany: body.authorCompany ? String(body.authorCompany).trim() : undefined,
        rating,
        text: String(body.text).trim(),
        spaceSlug: body.spaceSlug || 'default',
        status: 'approved',
        source: 'api',
        createdAt: new Date().toISOString(),
      };

      return new Response(
        JSON.stringify({
          success: true,
          testimonial: newTestimonial,
        }),
        {
          status: 201,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
  }

  if (pathname === '/api/v1/widgets') {
    const space = url.searchParams.get('space') || 'demo';
    const widgets = [
      {
        id: 'widget_marquee',
        name: 'Auto-Scrolling Marquee Ticker',
        layout: 'marquee',
        embedScript: `<script async src="${origin}/embed.js" data-space="${space}" data-layout="marquee"></script>`,
      },
      {
        id: 'widget_wall',
        name: 'Wall of Love Grid',
        layout: 'wall',
        embedScript: `<script async src="${origin}/embed.js" data-space="${space}" data-layout="wall"></script>`,
      },
      {
        id: 'widget_carousel',
        name: 'Interactive Review Carousel',
        layout: 'carousel',
        embedScript: `<script async src="${origin}/embed.js" data-space="${space}" data-layout="carousel"></script>`,
      },
      {
        id: 'widget_badge',
        name: 'Minimal Star Rating Badge',
        layout: 'badge',
        embedScript: `<script async src="${origin}/embed.js" data-space="${space}" data-layout="badge"></script>`,
      },
    ];

    return new Response(JSON.stringify({ widgets }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ error: `Not Found: ${pathname}` }), {
    status: 404,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
