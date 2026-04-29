import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

export default defineConfig({
  output: 'static',
  // edgeMiddleware compiles src/middleware.ts to a Vercel Edge Function so
  // the auth gate on /tools/* + /share/tools/* runs in front of static assets.
  // Required because output: 'static' has no SSR layer to host middleware.
  adapter: vercel({
    edgeMiddleware: true,
  }),
});
