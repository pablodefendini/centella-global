/**
 * Vercel serverless function: POST /api/subscribe
 *
 * Accepts { email, tag?, firstName?, lastName? }
 * Adds subscriber to Mailchimp and applies tag if provided.
 *
 * Implementation note: the Mailchimp helper is inlined here on purpose. When
 * @astrojs/vercel writes a Build Output API v3 bundle, the api/ directory is
 * picked up by Vercel's @vercel/node builder *separately* — it doesn't always
 * bundle imports outside api/, which causes FUNCTION_INVOCATION_FAILED at
 * runtime. Keeping the function bundle self-contained sidesteps that.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createHash } from 'node:crypto';

const API_KEY = process.env.MAILCHIMP_API_KEY ?? '';
const AUDIENCE_ID = process.env.MAILCHIMP_AUDIENCE_ID ?? '';
const SERVER_PREFIX = process.env.MAILCHIMP_SERVER_PREFIX ?? '';
const BASE_URL = `https://${SERVER_PREFIX}.api.mailchimp.com/3.0`;

interface SubscribeParams {
  email: string;
  tag?: string;
  firstName?: string;
  lastName?: string;
}

interface SubscribeResult {
  success: boolean;
  error?: string;
}

async function subscribe(params: SubscribeParams): Promise<SubscribeResult> {
  const { email, tag, firstName, lastName } = params;

  if (!API_KEY || !AUDIENCE_ID || !SERVER_PREFIX) {
    return { success: false, error: 'Mailchimp not configured' };
  }

  try {
    const response = await fetch(`${BASE_URL}/lists/${AUDIENCE_ID}/members`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email_address: email,
        status: 'subscribed',
        merge_fields: {
          ...(firstName && { FNAME: firstName }),
          ...(lastName && { LNAME: lastName }),
        },
      }),
    });

    // 200 = new subscriber, 400 with "Member Exists" = already subscribed (not an error)
    if (!response.ok) {
      const body = await response.json();
      if (body.title !== 'Member Exists') {
        return { success: false, error: body.detail ?? 'Failed to subscribe' };
      }
    }

    if (tag) {
      await applyTag(email, tag);
    }

    return { success: true };
  } catch {
    return { success: false, error: 'Network error' };
  }
}

async function applyTag(email: string, tag: string): Promise<void> {
  // Mailchimp uses MD5 hash of lowercase email as subscriber ID
  const subscriberHash = createHash('md5').update(email.toLowerCase()).digest('hex');

  await fetch(`${BASE_URL}/lists/${AUDIENCE_ID}/members/${subscriberHash}/tags`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      tags: [{ name: tag, status: 'active' }],
    }),
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, tag, firstName, lastName } = req.body ?? {};

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Email is required' });
  }

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
