/**
 * Edge middleware — HTTP Basic Auth gate for the staff-only /tools section.
 *
 * Compiled to a Vercel Edge Function via `vercel({ edgeMiddleware: true })`
 * in astro.config.mjs (required because output mode is 'static').
 *
 * Protects:
 *   /tools/*           — the tools archive and per-tool pages
 *   /share/tools/*     — the generated PDFs and PNGs themselves, so a direct
 *                        download URL doesn't bypass the gate
 *
 * Auth model: HTTP Basic Auth, single shared user + password from env
 * (`TOOLS_USERNAME` + `TOOLS_PASSWORD`). Staff and contractors share both.
 * Fails closed if either env var is unset.
 *
 * Notes:
 * - Runs on EVERY request to the site (Vercel routes all traffic through edge
 *   middleware before serving static assets). The non-protected path takes the
 *   fast path: a single startsWith check, then `next()`.
 * - No timing-safe compare needed for a single low-traffic shared credential —
 *   string equality is fine.
 */

import { defineMiddleware } from 'astro:middleware';

const PROTECTED_PREFIXES = ['/tools', '/share/tools'];

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + '/'),
  );
}

function unauthorized(): Response {
  return new Response('Authentication required.', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Centella Tools", charset="UTF-8"',
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

export const onRequest = defineMiddleware(async (context, next) => {
  const pathname = new URL(context.request.url).pathname;

  if (!isProtectedPath(pathname)) {
    return next();
  }

  const expectedUser = import.meta.env.TOOLS_USERNAME;
  const expectedPass = import.meta.env.TOOLS_PASSWORD;
  if (!expectedUser || !expectedPass) {
    // Fail closed — never serve the staff section unprotected even if either
    // env var is missing in a deploy.
    return new Response('Tools section auth is not configured.', {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  const header = context.request.headers.get('Authorization');
  if (!header?.startsWith('Basic ')) {
    return unauthorized();
  }

  let decoded: string;
  try {
    decoded = atob(header.slice('Basic '.length).trim());
  } catch {
    return unauthorized();
  }

  const colonIndex = decoded.indexOf(':');
  if (colonIndex === -1) return unauthorized();
  const username = decoded.slice(0, colonIndex);
  const password = decoded.slice(colonIndex + 1);

  if (username !== expectedUser || password !== expectedPass) {
    return unauthorized();
  }

  return next();
});
