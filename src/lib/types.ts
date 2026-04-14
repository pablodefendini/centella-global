/**
 * Shared TypeScript types for Centella Global
 *
 * These types represent the data structures fetched from Notion databases.
 * They're the contract between the Notion API layer and the Astro components.
 */

export interface Event {
  id: string;
  name: string;
  slug: string;
  status: 'Draft' | 'Published' | 'Archived';
  dateStart: string;
  dateEnd: string | null;
  location: string;
  tagline: string;
  heroImage: string | null;
  registrationUrl: string | null;
  registrationCta: string;
  mailchimpTag: string;
  featured: boolean;
  speakers: Speaker[];
  attendees: Attendee[];
  sponsors: Sponsor[];
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  status: 'Draft' | 'Published' | 'Archived';
  publishedDate: string;
  author: string;
  tags: string[];
  summary: string;
  heroImage: string | null;
}

export interface Speaker {
  id: string;
  name: string;
  titleRole: string;
  organization: string;
  photo: string | null;
}

export interface Attendee {
  id: string;
  name: string;
  titleRole: string;
  organization: string;
  photo: string | null;
}

export interface Sponsor {
  id: string;
  name: string;
  logo: string | null;
  url: string | null;
  tier: 'Lead' | 'Supporting' | 'Community';
}

/**
 * Rendered Notion page content — the HTML output of the block-to-HTML mapper.
 */
export interface RenderedContent {
  html: string;
}
