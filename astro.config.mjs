import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

export default defineConfig({
  output: 'static',
  // edgeMiddleware compiles src/middleware.ts to a Vercel Edge Function so
  // the auth gate on /tools/* runs in front of static assets (page routes
  // AND the per-team-member PDFs/PNGs co-located under /tools/<kind>/).
  // Required because output: 'static' has no SSR layer to host middleware.
  adapter: vercel({
    edgeMiddleware: true,
  }),
});
