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
  /**
   * Optional Notion relation to a single Event. When set, blog post pages
   * render a "From [Event]" eyebrow link to /events/{slug}, and listing
   * cards show "From [Event]" as plain text. The link 404s if the related
   * event isn't Published — content team's responsibility.
   */
  event: BlogPostEvent | null;
}

export interface BlogPostEvent {
  id: string;
  slug: string;
  name: string;
}

export interface Speaker {
  id: string;
  name: string;
  /** Their standing job title at their org (e.g. "Strategy Director"). */
  title: string;
  /** Their contextual function in this event (e.g. "Keynote Speaker"). */
  role: string;
  organization: string;
  photo: string | null;
}

export interface Attendee {
  id: string;
  name: string;
  /** Their standing job title at their org. */
  title: string;
  /** Their contextual function in this event (e.g. "Founding Partner"). */
  role: string;
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
  /** Their job title at Centella (e.g. "Co-founder", "Senior Strategist"). Goes on cards and email signatures. */
  title: string;
  /** Their contextual function (e.g. "Strategy lead, Latin America"). Available as a template token but not rendered by default. */
  role: string;
  email: string;
  phone: string;
  pronouns: string;
  linkedin: string | null;
  website: string | null;
  photo: string | null;
  /** Short one-liner shown next to the name on team cards / listings. */
  bio: string;
  /** Long-form biographical prose for team-detail surfaces (future). */
  biography: string;
}

/**
 * Rendered Notion page content — the HTML output of the block-to-HTML mapper.
 */
export interface RenderedContent {
  html: string;
}
