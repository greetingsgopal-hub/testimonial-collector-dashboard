import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(__dirname, 'ImportPage.tsx'), 'utf-8');

describe('TASK 7: Free-plan testimonial cap on owner-initiated imports', () => {
  it('CSV import checks the plan limit before creating reviews', () => {
    const m = src.match(/const handleCsvImport[\s\S]*?\n  \}, \[/);
    expect(m, 'handleCsvImport must exist').not.toBeNull();
    expect(m![0]).toContain('PLAN_LIMITS[workspace.plan].maxTestimonials');
    expect(m![0]).toContain('storage.getReviews(project.id)');
    // The cap check must run BEFORE the createReview loop
    const capIdx = m![0].indexOf('maxTestimonials');
    const createIdx = m![0].indexOf('storage.createReview');
    expect(capIdx).toBeGreaterThan(-1);
    expect(createIdx).toBeGreaterThan(capIdx);
  });

  it('manual import checks the plan limit before creating a review', () => {
    const m = src.match(/const handleManualImport[\s\S]*?\n  \}, \[/);
    expect(m, 'handleManualImport must exist').not.toBeNull();
    expect(m![0]).toContain('PLAN_LIMITS[workspace.plan].maxTestimonials');
    const capIdx = m![0].indexOf('maxTestimonials');
    const createIdx = m![0].indexOf('storage.createReview');
    expect(capIdx).toBeGreaterThan(-1);
    expect(createIdx).toBeGreaterThan(capIdx);
  });

  it('anonymous form submissions are NOT capped (PublicCollectorPage has no plan check)', () => {
    const collector = readFileSync(join(__dirname, 'PublicCollectorPage.tsx'), 'utf-8');
    expect(collector).not.toContain('PLAN_LIMITS');
    expect(collector).not.toContain('maxTestimonials');
  });
});
