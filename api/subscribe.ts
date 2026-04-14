/**
 * Vercel serverless function: POST /api/subscribe
 *
 * Accepts { email, tag?, firstName?, lastName? }
 * Adds subscriber to Mailchimp and applies tag if provided.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { subscribe } from '../src/lib/mailchimp';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only accept POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Parse body
  const { email, tag, firstName, lastName } = req.body ?? {};

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Email is required' });
  }

  // Basic email format check
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  const result = await subscribe({
    email,
    tag: typeof tag === 'string' ? tag : undefined,
    firstName: typeof firstName === 'string' ? firstName : undefined,
    lastName: typeof lastName === 'string' ? lastName : undefined,
  });

  if (result.success) {
    return res.status(200).json({ success: true });
  } else {
    return res.status(500).json({ success: false, error: result.error });
  }
}
