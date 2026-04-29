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
 * Team Profile — internal staff/contractor profiles used by the /tools section
 * to generate branded business cards and email signatures at build time.
 * Source DB: NOTION_TEAM_PROFILES_DB_ID. Not public-facing content.
 */
export interface TeamProfile {
  id: string;
  name: string;
  slug: string;
  status: 'Active' | 'Inactive';
  titleRole: string;
  email: string;
  phone: string;
  pronouns: string;
  linkedin: string | null;
  website: string | null;
  photo: string | null;
}

/**
 * Rendered Notion page content — the HTML output of the block-to-HTML mapper.
 */
export interface RenderedContent {
  html: string;
}
