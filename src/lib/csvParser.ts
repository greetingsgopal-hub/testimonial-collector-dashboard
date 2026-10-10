import { ReviewInput, ImportSource } from '../types';

export interface CsvParsedResult {
  headers: string[];
  rows: string[][];
}

export interface CsvMappingConfig {
  name?: string;
  role?: string;
  company?: string;
  content?: string;
  rating?: string;
  avatarUrl?: string;
  source?: string;
  email?: string;
}

export interface ValidatedRowResult {
  validReviews: ReviewInput[];
  invalidRows: {
    rowNumber: number;
    row: Record<string, string>;
    reasons: string[];
  }[];
}

/**
 * Lightweight RFC 4180 compliant CSV parser.
 * Supports comma delimiters, quotes, escaped quotes (""), and multiline values.
 */
export function parseCsvString(csvText: string): CsvParsedResult {
  if (!csvText || typeof csvText !== 'string') {
    return { headers: [], rows: [] };
  }

  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let insideQuote = false;

  const normalized = csvText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  for (let i = 0; i < normalized.length; i++) {
    const char = normalized[i];
    const nextChar = normalized[i + 1];

    if (char === '"') {
      if (insideQuote && nextChar === '"') {
        currentField += '"';
        i++; // skip escaped quote
      } else {
        insideQuote = !insideQuote;
      }
    } else if (char === ',' && !insideQuote) {
      currentRow.push(currentField.trim());
      currentField = '';
    } else if (char === '\n' && !insideQuote) {
      currentRow.push(currentField.trim());
      // Skip empty lines at end or between
      if (currentRow.some((f) => f.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentField = '';
    } else {
      currentField += char;
    }
  }

  // Push final trailing field/row if exists
  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some((f) => f.length > 0)) {
      rows.push(currentRow);
    }
  }

  if (rows.length === 0) {
    return { headers: [], rows: [] };
  }

  const headers = rows[0];
  const dataRows = rows.slice(1);

  return { headers, rows: dataRows };
}

/**
 * Automatically inspects column headers and matches them to standard testimonial fields.
 */
export function autoDetectColumnMapping(headers: string[]): CsvMappingConfig {
  const mapping: CsvMappingConfig = {};

  const clean = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

  const aliases: Record<keyof CsvMappingConfig, string[]> = {
    name: ['name', 'fullname', 'author', 'reviewer', 'client', 'customer', 'person'],
    role: ['role', 'title', 'jobtitle', 'position', 'handle', 'designation', 'occupation'],
    company: ['company', 'organization', 'org', 'business', 'agency', 'employer'],
    content: ['content', 'testimonial', 'review', 'feedback', 'message', 'comment', 'text', 'quote', 'body'],
    rating: ['rating', 'stars', 'score', 'rate', 'star'],
    avatarUrl: ['avatar', 'avatarurl', 'photo', 'photourl', 'image', 'imageurl', 'picture', 'icon'],
    source: ['source', 'platform', 'channel', 'provider'],
    email: ['email', 'emailaddress', 'mail'],
  };

  headers.forEach((h) => {
    const normalized = clean(h);
    (Object.keys(aliases) as (keyof CsvMappingConfig)[]).forEach((field) => {
      if (!mapping[field] && aliases[field].some((alias) => normalized === alias || normalized.includes(alias))) {
        mapping[field] = h;
      }
    });
  });

  return mapping;
}

/**
 * Normalizes and validates parsed rows according to PandaPraise's strict Firestore security schema.
 */
export function normalizeAndValidateRows(params: {
  headers: string[];
  rows: string[][];
  mapping: CsvMappingConfig;
  projectId: string;
  ownerId?: string;
}): ValidatedRowResult {
  const { headers, rows, mapping, projectId, ownerId } = params;
  const validReviews: ReviewInput[] = [];
  const invalidRows: ValidatedRowResult['invalidRows'] = [];

  const getColVal = (row: string[], colName?: string): string => {
    if (!colName) return '';
    const idx = headers.indexOf(colName);
    return idx >= 0 && row[idx] !== undefined ? row[idx].trim() : '';
  };

  rows.forEach((row, index) => {
    const rowNumber = index + 1;
    const rowObj: Record<string, string> = {};
    headers.forEach((h, i) => {
      rowObj[h] = row[i] || '';
    });

    const rawName = getColVal(row, mapping.name);
    const rawRole = getColVal(row, mapping.role);
    const rawCompany = getColVal(row, mapping.company);
    const rawContent = getColVal(row, mapping.content);
    const rawRating = getColVal(row, mapping.rating);
    const rawAvatarUrl = getColVal(row, mapping.avatarUrl);
    const rawSource = getColVal(row, mapping.source);
    const rawEmail = getColVal(row, mapping.email);

    const reasons: string[] = [];

    // Content validation (Firestore schema: 10 <= content.size() <= 2500)
    const content = rawContent.replace(/\s+/g, ' ').trim();
    if (content.length < 10) {
      reasons.push('Content must be at least 10 characters long.');
    } else if (content.length > 2500) {
      reasons.push('Content exceeds maximum length of 2,500 characters.');
    }

    // Rating validation & normalization (1 to 5)
    let rating = 5;
    if (rawRating) {
      const parsedRating = parseInt(rawRating, 10);
      if (!isNaN(parsedRating)) {
        rating = Math.max(1, Math.min(5, parsedRating));
      }
    }

    // Name normalization (1 to 100 characters)
    let name = rawName || 'Anonymous Customer';
    if (name.length > 100) {
      name = name.slice(0, 100);
    }

    // Role & Company (max 120 chars)
    const role = (rawRole || 'Verified Customer').slice(0, 120);
    const company = rawCompany ? rawCompany.slice(0, 100) : undefined;

    // Avatar URL (max 75000 chars)
    let avatarUrl: string | undefined = undefined;
    if (rawAvatarUrl && rawAvatarUrl.length <= 75000) {
      avatarUrl = rawAvatarUrl;
    }

    // Source (valid ImportSource)
    const validSources: ImportSource[] = [
      'form', 'twitter', 'linkedin', 'google', 'g2', 'trustpilot', 'producthunt',
      'capterra', 'yelp', 'shopify', 'appstore', 'playstore', 'facebook', 'reddit',
      'csv', 'manual', 'import', 'screenshot', 'instagram'
    ];
    const normalizedSource = (rawSource || '').toLowerCase().trim();
    const source: ImportSource = validSources.includes(normalizedSource as ImportSource)
      ? (normalizedSource as ImportSource)
      : 'csv';

    // Email (max 150 chars)
    const email = rawEmail ? rawEmail.slice(0, 150) : '';

    if (reasons.length > 0) {
      invalidRows.push({ rowNumber, row: rowObj, reasons });
    } else {
      validReviews.push({
        projectId,
        ownerId: ownerId || '',
        name,
        email,
        role,
        company,
        avatarUrl,
        rating,
        content,
        type: 'text',
        tags: ['imported', source],
        source,
        status: 'approved',
        consent: true,
        isFeatured: false,
      });
    }
  });

  return { validReviews, invalidRows };
}

/**
 * Returns a ready-to-use CSV template for customer download.
 */
export function generateCsvTemplate(): string {
  return [
    'Author Name,Handle or Title,Company,Content,Rating,Avatar URL,Source',
    '"Sarah Jenkins","Product Lead","Acme Corp","PandaPraise made gathering social proof completely frictionless. Within 2 days of deploying our widget, conversions increased by 28%.",5,"https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120","csv"',
    '"Alex Rivera","Founder & CEO","Rivera Designs","Our clients love how easy it is to leave video and text reviews without downloading any apps or logging in.",5,"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120","csv"',
    '"Elena Rostova","Head of Growth","FinTech Pulse","The Wall of Love embed took literally two minutes to integrate into Webflow. Outstanding developer experience.",5,"","csv"',
  ].join('\n');
}
