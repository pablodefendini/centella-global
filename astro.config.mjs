import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import { existsSync, statSync, createReadStream } from 'node:fs';
import { resolve, join } from 'node:path';

/**
 * Dev-only middleware: serve files under <repo>/share/ at /share/*.
 *
 * In production, scripts/copy-share.mjs mirrors share/ into dist/share/
 * and .vercel/output/static/share/ so Vercel serves /share/* directly.
 * The dev server (astro dev) doesn't run that postbuild and only knows
 * about src/pages/ + public/, so without this plugin /share/ and
 * /share/work/ 404 during local development. This plugin closes that
 * gap by reading from share/ at the repo root and streaming it back
 * with the right Content-Type. apply: 'serve' scopes it to dev — the
 * production build pipeline is unchanged.
 */
const SHARE_DIR = resolve('share');
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.txt': 'text/plain; charset=utf-8',
  '.pdf': 'application/pdf',
};

function mimeOf(filePath) {
  const i = filePath.lastIndexOf('.');
  return (i >= 0 && MIME[filePath.slice(i).toLowerCase()]) || 'application/octet-stream';
}

function shareServeDev() {
  return {
    name: 'centella:share-serve-dev',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url) return next();
        const urlPath = req.url.split('?')[0];
        if (urlPath !== '/share' && !urlPath.startsWith('/share/')) return next();

        // Map /share/<rest> → <repo>/share/<rest>. Block path traversal
        // by resolving the candidate and ensuring it's still under SHARE_DIR.
        const rel = urlPath.replace(/^\/share\/?/, '');
        const candidate = resolve(rel ? join(SHARE_DIR, rel) : SHARE_DIR);
        if (!candidate.startsWith(SHARE_DIR)) return next();

        let target = candidate;
        if (existsSync(target) && statSync(target).isDirectory()) {
          // Redirect /share → /share/ so relative hrefs resolve correctly.
          if (!urlPath.endsWith('/')) {
            res.statusCode = 301;
            res.setHeader('Location', urlPath + '/');
            res.end();
            return;
          }
          target = join(target, 'index.html');
        }

        if (!existsSync(target) || !statSync(target).isFile()) return next();

        res.statusCode = 200;
        res.setHeader('Content-Type', mimeOf(target));
        createReadStream(target).pipe(res);
      });
    },
  };
}

export default defineConfig({
  output: 'static',
  // edgeMiddleware compiles src/middleware.ts to a Vercel Edge Function so
  // the auth gate on /tools/* runs in front of static assets (page routes
  // AND the per-team-member PDFs/PNGs co-located under /tools/<kind>/).
  // Required because output: 'static' has no SSR layer to host middleware.
  adapter: vercel({
    edgeMiddleware: true,
  }),
  vite: {
    plugins: [shareServeDev()],
  },
});
