import { describe, it, expect } from 'vitest';
import {
  parseCsvString,
  autoDetectColumnMapping,
  normalizeAndValidateRows,
  generateCsvTemplate,
} from '../csvParser';

describe('csvParser - RFC 4180 parsing and validation', () => {
  it('parses standard comma-separated text into rows and columns', () => {
    const csv = 'Name,Content,Rating\nAlice,Great product!,5\nBob,Loved the service,4';
    const result = parseCsvString(csv);

    expect(result.headers).toEqual(['Name', 'Content', 'Rating']);
    expect(result.rows).toHaveLength(2);
    expect(result.rows[0]).toEqual(['Alice', 'Great product!', '5']);
    expect(result.rows[1]).toEqual(['Bob', 'Loved the service', '4']);
  });

  it('handles quoted fields with commas and escaped quotes', () => {
    const csv = 'Name,Content,Company\n"Jane ""VIP"" Doe","Awesome tool, saved us time!","Acme, Inc."';
    const result = parseCsvString(csv);

    expect(result.rows).toHaveLength(1);
    expect(result.rows[0][0]).toBe('Jane "VIP" Doe');
    expect(result.rows[0][1]).toBe('Awesome tool, saved us time!');
    expect(result.rows[0][2]).toBe('Acme, Inc.');
  });

  it('auto-detects common column headers into field mappings', () => {
    const headers = ['Full Name', 'Feedback Message', 'Stars', 'Job Title', 'Organization', 'Photo URL'];
    const mapping = autoDetectColumnMapping(headers);

    expect(mapping.name).toBe('Full Name');
    expect(mapping.content).toBe('Feedback Message');
    expect(mapping.rating).toBe('Stars');
    expect(mapping.role).toBe('Job Title');
    expect(mapping.company).toBe('Organization');
    expect(mapping.avatarUrl).toBe('Photo URL');
  });

  it('normalizes valid rows and enforces Firestore security schema', () => {
    const headers = ['Name', 'Content', 'Rating', 'Role', 'Company'];
    const rows = [
      ['Sarah Connor', 'This platform revolutionized our entire testimonial collection pipeline!', '5', 'CTO', 'Cyberdyne'],
      ['', 'Another super helpful review that is well over 10 characters long.', '4', '', ''],
    ];

    const mapping = {
      name: 'Name',
      content: 'Content',
      rating: 'Rating',
      role: 'Role',
      company: 'Company',
    };

    const { validReviews, invalidRows } = normalizeAndValidateRows({
      headers,
      rows,
      mapping,
      projectId: 'proj_123',
      ownerId: 'owner_user_abc',
    });

    expect(invalidRows).toHaveLength(0);
    expect(validReviews).toHaveLength(2);

    expect(validReviews[0]).toMatchObject({
      projectId: 'proj_123',
      ownerId: 'owner_user_abc',
      name: 'Sarah Connor',
      role: 'CTO',
      company: 'Cyberdyne',
      rating: 5,
      status: 'approved',
      consent: true,
      source: 'csv',
      type: 'text',
    });

    // Fallback for empty name
    expect(validReviews[1].name).toBe('Anonymous Customer');
    expect(validReviews[1].rating).toBe(4);
  });

  it('flags invalid rows that violate Firestore constraints', () => {
    const headers = ['Name', 'Content', 'Rating'];
    const rows = [
      ['Shorty', 'Too short', '5'], // content < 10 characters
      ['Valid User', 'Content that is plenty long and definitely passes the character check.', '99'], // rating outside 1-5 will be clamped to 5 or validated
    ];

    const mapping = { name: 'Name', content: 'Content', rating: 'Rating' };

    const { validReviews, invalidRows } = normalizeAndValidateRows({
      headers,
      rows,
      mapping,
      projectId: 'proj_123',
      ownerId: 'owner_user_abc',
    });

    expect(invalidRows).toHaveLength(1);
    expect(invalidRows[0].rowNumber).toBe(1);
    expect(invalidRows[0].reasons.some((r) => r.includes('10 characters'))).toBe(true);

    expect(validReviews).toHaveLength(1);
    expect(validReviews[0].rating).toBe(5); // clamped to 5
  });

  it('generates a valid CSV sample template string', () => {
    const template = generateCsvTemplate();
    expect(template).toContain('Author Name,Handle or Title,Company,Content,Rating,Avatar URL,Source');
    expect(template).toContain('PandaPraise');
  });
});
