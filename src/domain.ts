export type Focus = 'Boxing' | 'MMA' | 'Mixed';

export interface Retreat {
  slug: string;
  name: string;
  country: string;
  region: string;
  focus: Focus;
  image: string;
  description: string;
  status: 'example' | 'confirmed';
  dates: { start: string; end: string } | null;
  availability?: string;
  startingPrice?: string;
}

export const retreats: Retreat[] = [
  { slug: 'thailand', name: 'Thailand', country: 'Thailand', region: 'Phuket', focus: 'Mixed', image: '/media/thailand.jpg', description: 'Open-air training, a coastline worth exploring and time to recover between sessions.', status: 'example', dates: null },
  { slug: 'spain', name: 'Spain', country: 'Spain', region: 'Costa del Sol', focus: 'Boxing', image: '/media/spain.jpg', description: 'Boxing sessions paired with sea swims, late meals and time on the Mediterranean coast.', status: 'example', dates: null },
  { slug: 'portugal', name: 'Portugal', country: 'Portugal', region: 'Algarve', focus: 'MMA', image: '/media/portugal.jpg', description: 'Technical training and a slower pace between sessions on the Atlantic coast.', status: 'example', dates: null },
  { slug: 'dubai', name: 'Dubai', country: 'United Arab Emirates', region: 'Dubai', focus: 'Mixed', image: '/media/dubai.jpg', description: 'A city-based camp concept with time to explore the coast and desert.', status: 'example', dates: null },
];

export function retreatMatches(retreat: Retreat, filters: { destination: string; focus: string; year: string }) {
  return (!filters.destination || retreat.country === filters.destination) &&
    (!filters.focus || retreat.focus === filters.focus) &&
    (!filters.year || (retreat.status === 'confirmed' && !!retreat.dates &&
      filters.year >= retreat.dates.start.slice(0, 4) && filters.year <= retreat.dates.end.slice(0, 4)));
}

export const experienceLevels = ['Beginner', 'Some experience', 'Regular training', 'Competitive'] as const;
export const contactTopics = ['General enquiry', 'Retreat enquiry', 'Collaboration / partnership'] as const;
export type Enquiry =
  | { kind: 'contact'; name: string; email: string; topic: string; message: string }
  | { kind: 'booking'; name: string; email: string; phone: string; retreat: string; experience: string; message: string };

export function validateEnquiry(input: unknown): Enquiry | null {
  if (!input || typeof input !== 'object') return null;
  const fields = input as Record<string, unknown>;
  const get = (key: string) => typeof fields[key] === 'string' ? fields[key].trim() : '';
  const name = get('name');
  const email = get('email');
  const message = get('message');
  if (name.length < 2 || name.length > 100 || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || message.length > 2000) return null;

  if (fields.kind === 'contact') {
    const topic = get('topic');
    if (!contactTopics.some((item) => item === topic) || !message) return null;
    return { kind: 'contact', name, email, topic, message };
  }
  if (fields.kind !== 'booking') return null;
  const phone = get('phone');
  const retreat = get('retreat');
  const experience = get('experience');
  const digits = phone.replace(/\D/g, '');
  if (!/^\+?[\d ().-]+$/.test(phone) || digits.length < 7 || digits.length > 15 || phone.length > 30) return null;
  if (!retreats.some((item) => item.slug === retreat) || !experienceLevels.some((item) => item === experience)) return null;
  return { kind: 'booking', name, email, phone, retreat, experience, message };
}

export function isMediaSource(value: string) {
  if (/^\/(media|api\/media\/files)\/[\w-]+\.[\w]+$/.test(value)) return true;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password;
  } catch {
    return false;
  }
}

export function isInstagramPost(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password &&
      ['instagram.com', 'www.instagram.com'].includes(url.hostname) &&
      /^\/(p|reel|tv)\/[\w-]+\/?$/.test(url.pathname);
  } catch {
    return false;
  }
}

export const mediaCategories = ['Training', 'Community', 'Behind the scenes', 'Destinations'] as const;

export interface Media {
  id: string;
  kind: 'image' | 'video';
  src: string;
  thumbnail?: string;
  caption: string;
  instagram?: string;
  retreat?: string;
  category: typeof mediaCategories[number];
  featured: boolean;
  example?: boolean;
}

export function validateMedia(input: unknown): Omit<Media, 'id'> | null {
  if (!input || typeof input !== 'object') return null;
  const fields = input as Record<string, unknown>;
  const get = (key: string) => typeof fields[key] === 'string' ? fields[key].trim() : '';
  const kind = get('kind');
  const src = get('src');
  const thumbnail = get('thumbnail');
  const instagram = get('instagram');
  const retreat = get('retreat');
  const caption = get('caption');
  const category = mediaCategories.find((item) => item === get('category'));
  if ((kind !== 'image' && kind !== 'video') || !category || !caption || caption.length > 300) return null;
  if (src.length > 2000 || thumbnail.length > 2000 || instagram.length > 2000 ||
      !isMediaSource(src) || (thumbnail && !isMediaSource(thumbnail)) || (instagram && !isInstagramPost(instagram))) return null;
  if (retreat && !retreats.some((item) => item.slug === retreat)) return null;
  return { kind, src, thumbnail, instagram, retreat, caption, category, featured: fields.featured === true };
}
