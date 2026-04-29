/**
 * Notion API client and query helpers.
 *
 * All data fetching happens at build time via getStaticPaths() or page frontmatter.
 * Nothing in this file should ever run on the client.
 */

import { Client } from '@notionhq/client';
import type {
  Event,
  BlogPost,
  Speaker,
  Attendee,
  Sponsor,
  TeamProfile,
  RenderedContent,
} from './types';

// --- Client ---

const notion = new Client({
  auth: import.meta.env.NOTION_API_KEY,
});

const EVENTS_DB = import.meta.env.NOTION_EVENTS_DB_ID;
const BLOG_DB = import.meta.env.NOTION_BLOG_DB_ID;
const SPEAKERS_DB = import.meta.env.NOTION_SPEAKERS_DB_ID;
const ATTENDEES_DB = import.meta.env.NOTION_ATTENDEES_DB_ID;
const SPONSORS_DB = import.meta.env.NOTION_SPONSORS_DB_ID;
const TEAM_PROFILES_DB = import.meta.env.NOTION_TEAM_PROFILES_DB_ID;

// --- Helpers for extracting Notion property values ---

type NotionPage = any; // Notion SDK types are verbose; we extract what we need.

function getText(prop: any): string {
  if (!prop) return '';
  if (prop.type === 'title') return prop.title?.map((t: any) => t.plain_text).join('') ?? '';
  if (prop.type === 'rich_text') return prop.rich_text?.map((t: any) => t.plain_text).join('') ?? '';
  return '';
}

function getSelect(prop: any): string {
  return prop?.select?.name ?? '';
}

function getMultiSelect(prop: any): string[] {
  return prop?.multi_select?.map((s: any) => s.name) ?? [];
}

function getCheckbox(prop: any): boolean {
  return prop?.checkbox ?? false;
}

function getUrl(prop: any): string | null {
  return prop?.url ?? null;
}

function getDate(prop: any): string {
  return prop?.date?.start ?? '';
}

function getDateEnd(prop: any): string | null {
  return prop?.date?.end ?? null;
}

function getFile(prop: any): string | null {
  if (!prop?.files?.length) return null;
  const file = prop.files[0];
  // Notion files can be "file" (uploaded) or "external" (linked)
  return file.file?.url ?? file.external?.url ?? null;
}

function getRelationIds(prop: any): string[] {
  return prop?.relation?.map((r: any) => r.id) ?? [];
}

function getEmail(prop: any): string {
  return prop?.email ?? '';
}

function getPhone(prop: any): string {
  return prop?.phone_number ?? '';
}

// --- Events ---

export async function getPublishedEvents(): Promise<Event[]> {
  const response = await notion.databases.query({
    database_id: EVENTS_DB,
    filter: {
      property: 'Status',
      select: { equals: 'Published' },
    },
    sorts: [{ property: 'Date Start', direction: 'ascending' }],
  });

  return Promise.all(response.results.map(pageToEvent));
}

export async function getFeaturedEvents(): Promise<Event[]> {
  const now = new Date().toISOString().split('T')[0];
  const response = await notion.databases.query({
    database_id: EVENTS_DB,
    filter: {
      and: [
        { property: 'Status', select: { equals: 'Published' } },
        { property: 'Featured', checkbox: { equals: true } },
        { property: 'Date Start', date: { on_or_after: now } },
      ],
    },
    sorts: [{ property: 'Date Start', direction: 'ascending' }],
  });

  return Promise.all(response.results.map(pageToEvent));
}

/** Next upcoming published event, or if none, the most recently started past event. */
export async function getHomepageLatestEvent(): Promise<Event | null> {
  const now = new Date().toISOString().split('T')[0];

  const upcoming = await notion.databases.query({
    database_id: EVENTS_DB,
    filter: {
      and: [
        { property: 'Status', select: { equals: 'Published' } },
        { property: 'Date Start', date: { on_or_after: now } },
      ],
    },
    sorts: [{ property: 'Date Start', direction: 'ascending' }],
    page_size: 1,
  });

  if (upcoming.results.length) {
    return pageToEvent(upcoming.results[0]);
  }

  const past = await notion.databases.query({
    database_id: EVENTS_DB,
    filter: {
      and: [
        { property: 'Status', select: { equals: 'Published' } },
        { property: 'Date Start', date: { before: now } },
      ],
    },
    sorts: [{ property: 'Date Start', direction: 'descending' }],
    page_size: 1,
  });

  if (!past.results.length) return null;
  return pageToEvent(past.results[0]);
}

export async function getEventBySlug(slug: string): Promise<Event | null> {
  const response = await notion.databases.query({
    database_id: EVENTS_DB,
    filter: {
      and: [
        { property: 'Slug', rich_text: { equals: slug } },
        { property: 'Status', select: { equals: 'Published' } },
      ],
    },
  });

  if (!response.results.length) return null;
  return pageToEvent(response.results[0]);
}

async function pageToEvent(page: NotionPage): Promise<Event> {
  const props = page.properties;

  const speakerIds = getRelationIds(props['Speakers']);
  const attendeeIds = getRelationIds(props['Attendees']);
  const sponsorIds = getRelationIds(props['Sponsors']);

  const [speakers, attendees, sponsors] = await Promise.all([
    Promise.all(speakerIds.map(getSpeakerById)),
    Promise.all(attendeeIds.map(getAttendeeById)),
    Promise.all(sponsorIds.map(getSponsorById)),
  ]);

  return {
    id: page.id,
    name: getText(props['Name']),
    slug: getText(props['Slug']),
    status: getSelect(props['Status']) as Event['status'],
    dateStart: getDate(props['Date Start']),
    dateEnd: getDateEnd(props['Date End']),
    location: getText(props['Location']),
    tagline: getText(props['Tagline']),
    heroImage: getFile(props['Hero Image']),
    registrationUrl: getUrl(props['Registration URL']),
    registrationCta: getText(props['Registration CTA']) || 'Register',
    mailchimpTag: getText(props['Mailchimp Tag']),
    featured: getCheckbox(props['Featured']),
    speakers: speakers.filter(Boolean) as Speaker[],
    attendees: attendees.filter(Boolean) as Attendee[],
    sponsors: sponsors.filter(Boolean) as Sponsor[],
  };
}

// --- Blog Posts ---

export async function getPublishedBlogPosts(): Promise<BlogPost[]> {
  const response = await notion.databases.query({
    database_id: BLOG_DB,
    filter: {
      property: 'Status',
      select: { equals: 'Published' },
    },
    sorts: [{ property: 'Published Date', direction: 'descending' }],
  });

  return response.results.map(pageToBlogPost);
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const response = await notion.databases.query({
    database_id: BLOG_DB,
    filter: {
      and: [
        { property: 'Slug', rich_text: { equals: slug } },
        { property: 'Status', select: { equals: 'Published' } },
      ],
    },
  });

  if (!response.results.length) return null;
  return pageToBlogPost(response.results[0]);
}

function pageToBlogPost(page: NotionPage): BlogPost {
  const props = page.properties;
  return {
    id: page.id,
    title: getText(props['Title']),
    slug: getText(props['Slug']),
    status: getSelect(props['Status']) as BlogPost['status'],
    publishedDate: getDate(props['Published Date']),
    author: getText(props['Author']),
    tags: getMultiSelect(props['Tags']),
    summary: getText(props['Summary']),
    heroImage: getFile(props['Hero Image']),
  };
}

// --- Speakers ---

async function getSpeakerById(id: string): Promise<Speaker | null> {
  try {
    const page = await notion.pages.retrieve({ page_id: id });
    const props = (page as any).properties;
    return {
      id: page.id,
      name: getText(props['Name']),
      title: getText(props['Title']),
      role: getText(props['Role']),
      organization: getText(props['Organization']),
      photo: getFile(props['Photo']),
    };
  } catch {
    return null;
  }
}

// --- Attendees ---

async function getAttendeeById(id: string): Promise<Attendee | null> {
  try {
    const page = await notion.pages.retrieve({ page_id: id });
    const props = (page as any).properties;
    return {
      id: page.id,
      name: getText(props['Name']),
      title: getText(props['Title']),
      role: getText(props['Role']),
      organization: getText(props['Organization']),
      photo: getFile(props['Photo']),
    };
  } catch {
    return null;
  }
}

// --- Sponsors ---

async function getSponsorById(id: string): Promise<Sponsor | null> {
  try {
    const page = await notion.pages.retrieve({ page_id: id });
    const props = (page as any).properties;
    return {
      id: page.id,
      name: getText(props['Name']),
      logo: getFile(props['Logo']),
      url: getUrl(props['URL']),
      tier: getSelect(props['Tier']) as Sponsor['tier'],
    };
  } catch {
    return null;
  }
}

// --- Team Profiles (staff + contractors, /tools section only) ---

/**
 * Returns Active team profiles. Used at build time by scripts/build-team-assets.mjs
 * (to render per-person business cards + email signatures) AND by the /tools pages
 * (to list each person with download links). Not exposed in any public-facing route.
 *
 * If NOTION_TEAM_PROFILES_DB_ID is unset, returns an empty array — lets the build
 * succeed before the Notion DB is created.
 */
export async function getTeamProfiles(): Promise<TeamProfile[]> {
  if (!TEAM_PROFILES_DB) return [];

  const response = await notion.databases.query({
    database_id: TEAM_PROFILES_DB,
    filter: {
      property: 'Status',
      select: { equals: 'Active' },
    },
    sorts: [{ property: 'Name', direction: 'ascending' }],
  });

  return response.results.map(pageToTeamProfile);
}

function pageToTeamProfile(page: NotionPage): TeamProfile {
  const props = page.properties;
  return {
    id: page.id,
    name: getText(props['Name']),
    slug: getText(props['Slug']),
    status: (getSelect(props['Status']) || 'Active') as TeamProfile['status'],
    title: getText(props['Title']),
    role: getText(props['Role']),
    email: getEmail(props['Email']),
    phone: getPhone(props['Phone']),
    pronouns: getText(props['Pronouns']),
    linkedin: getUrl(props['LinkedIn']),
    website: getUrl(props['Website']),
    photo: getFile(props['Photo']),
  };
}

// --- Notion Block Renderer ---
// Converts Notion page body blocks to HTML.
// Handles common block types gracefully; skips unknown types.

export async function getPageContent(pageId: string): Promise<RenderedContent> {
  const blocks = await getAllBlocks(pageId);
  const html = blocksToHtml(blocks);
  return { html };
}

async function getAllBlocks(blockId: string): Promise<any[]> {
  const blocks: any[] = [];
  let cursor: string | undefined;

  do {
    const response = await notion.blocks.children.list({
      block_id: blockId,
      start_cursor: cursor,
      page_size: 100,
    });
    blocks.push(...response.results);
    cursor = response.has_more ? response.next_cursor ?? undefined : undefined;
  } while (cursor);

  return blocks;
}

function blocksToHtml(blocks: any[]): string {
  let html = '';
  let inList: 'bulleted' | 'numbered' | null = null;

  for (const block of blocks) {
    const type = block.type;

    // Close list if we've left a list context
    if (inList === 'bulleted' && type !== 'bulleted_list_item') {
      html += '</ul>';
      inList = null;
    }
    if (inList === 'numbered' && type !== 'numbered_list_item') {
      html += '</ol>';
      inList = null;
    }

    switch (type) {
      case 'paragraph':
        html += `<p>${richTextToHtml(block.paragraph.rich_text)}</p>`;
        break;

      case 'heading_1':
        html += `<h2>${richTextToHtml(block.heading_1.rich_text)}</h2>`;
        break;

      case 'heading_2':
        html += `<h3>${richTextToHtml(block.heading_2.rich_text)}</h3>`;
        break;

      case 'heading_3':
        html += `<h4>${richTextToHtml(block.heading_3.rich_text)}</h4>`;
        break;

      case 'bulleted_list_item':
        if (inList !== 'bulleted') {
          html += '<ul>';
          inList = 'bulleted';
        }
        html += `<li>${richTextToHtml(block.bulleted_list_item.rich_text)}</li>`;
        break;

      case 'numbered_list_item':
        if (inList !== 'numbered') {
          html += '<ol>';
          inList = 'numbered';
        }
        html += `<li>${richTextToHtml(block.numbered_list_item.rich_text)}</li>`;
        break;

      case 'quote':
        html += `<blockquote>${richTextToHtml(block.quote.rich_text)}</blockquote>`;
        break;

      case 'callout':
        html += `<aside class="callout">${richTextToHtml(block.callout.rich_text)}</aside>`;
        break;

      case 'code':
        html += `<pre><code>${escapeHtml(block.code.rich_text.map((t: any) => t.plain_text).join(''))}</code></pre>`;
        break;

      case 'divider':
        html += '<hr>';
        break;

      case 'image': {
        const url = block.image.file?.url ?? block.image.external?.url ?? '';
        const caption = block.image.caption?.map((t: any) => t.plain_text).join('') ?? '';
        if (url) {
          html += `<figure><img src="${escapeAttr(url)}" alt="${escapeAttr(caption)}" loading="lazy">`;
          if (caption) html += `<figcaption>${escapeHtml(caption)}</figcaption>`;
          html += '</figure>';
        }
        break;
      }

      case 'toggle': {
        const summary = richTextToHtml(block.toggle.rich_text);
        html += `<details><summary>${summary}</summary></details>`;
        break;
      }

      case 'bookmark': {
        const bookmarkUrl = block.bookmark.url ?? '';
        const bookmarkCaption = block.bookmark.caption?.map((t: any) => t.plain_text).join('') ?? bookmarkUrl;
        html += `<p><a href="${escapeAttr(bookmarkUrl)}">${escapeHtml(bookmarkCaption)}</a></p>`;
        break;
      }

      // Skip unknown block types silently
      default:
        break;
    }
  }

  // Close any trailing list
  if (inList === 'bulleted') html += '</ul>';
  if (inList === 'numbered') html += '</ol>';

  return html;
}

function richTextToHtml(richText: any[]): string {
  if (!richText?.length) return '';

  return richText.map((segment: any) => {
    let text = escapeHtml(segment.plain_text);

    if (segment.annotations.bold) text = `<strong>${text}</strong>`;
    if (segment.annotations.italic) text = `<em>${text}</em>`;
    if (segment.annotations.strikethrough) text = `<del>${text}</del>`;
    if (segment.annotations.underline) text = `<u>${text}</u>`;
    if (segment.annotations.code) text = `<code>${text}</code>`;

    if (segment.href) {
      text = `<a href="${escapeAttr(segment.href)}">${text}</a>`;
    }

    return text;
  }).join('');
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeAttr(str: string): string {
  return str.replace(/"/g, '&quot;').replace(/&/g, '&amp;');
}
