/**
 * Mailchimp API helper.
 * Used by the serverless function in api/subscribe.ts.
 */

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

export async function subscribe(params: SubscribeParams): Promise<SubscribeResult> {
  const { email, tag, firstName, lastName } = params;

  if (!API_KEY || !AUDIENCE_ID || !SERVER_PREFIX) {
    return { success: false, error: 'Mailchimp not configured' };
  }

  try {
    // Add or update subscriber
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
      if (body.title === 'Member Exists') {
        // Already subscribed — still apply the tag below
      } else {
        return { success: false, error: body.detail ?? 'Failed to subscribe' };
      }
    }

    // Apply tag if provided
    if (tag) {
      await applyTag(email, tag);
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: 'Network error' };
  }
}

async function applyTag(email: string, tag: string): Promise<void> {
  // Mailchimp uses MD5 hash of lowercase email as subscriber ID
  const subscriberHash = await md5(email.toLowerCase());

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

async function md5(text: string): Promise<string> {
  // Use Web Crypto API (available in Node 18+ and all modern runtimes)
  // Mailchimp requires MD5 — we use Node's crypto module in serverless context
  const { createHash } = await import('node:crypto');
  return createHash('md5').update(text).digest('hex');
}
