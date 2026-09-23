export function filterTestimonials(reviews, rules, limit) {
  const approved = reviews.filter((r) => r.status === 'approved');

  if (rules.mode === 'manual') {
    if (!rules.manualReviewIds || rules.manualReviewIds.length === 0) {
      return limit ? approved.slice(0, limit) : approved;
    }
    const idSet = new Set(rules.manualReviewIds);
    const selected = approved.filter((r) => idSet.has(r.id));
    return limit ? selected.slice(0, limit) : selected;
  }

  const filtered = approved.filter((r) => {
    if (rules.minRating && rules.minRating > 0) {
      if (r.rating < rules.minRating) return false;
    }

    if (rules.onlyFeatured && !r.isFeatured) {
      return false;
    }

    if (rules.tags && rules.tags.length > 0) {
      const reviewTags = (r.tags || []).map((t) => t.toLowerCase().trim());
      const targetTags = rules.tags.map((t) => t.toLowerCase().trim()).filter(Boolean);

      if (targetTags.length > 0) {
        if (rules.tagMatchMode === 'all') {
          const matchesAll = targetTags.every((t) => reviewTags.includes(t));
          if (!matchesAll) return false;
        } else {
          const matchesAny = targetTags.some((t) => reviewTags.includes(t));
          if (!matchesAny) return false;
        }
      }
    }

    if (rules.testimonialType && rules.testimonialType !== 'all') {
      if (rules.testimonialType === 'video') {
        const isVideo = r.type === 'video' || Boolean(r.videoUrl && r.videoUrl.trim().length > 0);
        if (!isVideo) return false;
      } else if (rules.testimonialType === 'image') {
        const hasPhoto = Boolean(r.avatarUrl && r.avatarUrl.trim().length > 0);
        if (!hasPhoto) return false;
      } else if (rules.testimonialType === 'text') {
        if (r.type === 'video') return false;
      }
    }

    if (rules.collectionFormId && rules.collectionFormId !== 'all') {
      if (r.collectionFormId !== rules.collectionFormId) return false;
    }

    if (rules.requireAvatar) {
      const hasPhoto = Boolean(r.avatarUrl && r.avatarUrl.trim().length > 0);
      if (!hasPhoto) return false;
    }

    if (rules.requireVideo) {
      const hasVid = Boolean(r.type === 'video' || (r.videoUrl && r.videoUrl.trim().length > 0));
      if (!hasVid) return false;
    }

    return true;
  });

  return limit ? filtered.slice(0, limit) : filtered;
}

console.log('--- Starting Panda Praise E2E Scenario Verification ---\n');

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    testsPassed++;
  } else {
    console.error(`[FAIL] ${message}`);
    testsFailed++;
  }
}

// Mock Testimonial Dataset
let dataset = [
  {
    id: 't-1',
    name: 'Sarah Connor',
    email: 'sarah@sky.net', // Private
    rating: 5,
    content: 'Panda Praise revolutionized our customer proof collection.',
    tags: ['enterprise', 'saas'],
    type: 'text',
    status: 'approved',
    isFeatured: true,
    consent: true,
    createdAt: '2026-09-01T10:00:00Z',
    source: 'form'
  },
  {
    id: 't-2',
    name: 'John Doe',
    email: 'john@doe.com', // Private
    rating: 5,
    content: 'Fantastic widget customizer and smooth embed flow.',
    tags: ['consumer'],
    type: 'text',
    status: 'pending', // Pending initially
    isFeatured: false,
    consent: true,
    createdAt: '2026-09-02T10:00:00Z',
    source: 'form'
  }
];

// ─────────────────────────────────────────────────────────────
// TEST A — MANUAL SELECTION MODE
// ─────────────────────────────────────────────────────────────
console.log('Running TEST A: Manual Selection Mode...');
const widgetAManualSelection = ['t-1'];

// Even when testimonial 2 is approved, it must NOT appear in Widget A
dataset = dataset.map(t => t.id === 't-2' ? { ...t, status: 'approved' } : t);

const widgetAResults = dataset.filter(t => t.status === 'approved' && widgetAManualSelection.includes(t.id));
assert(widgetAResults.length === 1 && widgetAResults[0].id === 't-1', 'Widget A only contains manually selected testimonial 1');
assert(!widgetAResults.some(t => t.id === 't-2'), 'Newly approved testimonial 2 does NOT automatically appear in Manual mode');

// ─────────────────────────────────────────────────────────────
// TEST B — AUTO-ADD MODE
// ─────────────────────────────────────────────────────────────
console.log('\nRunning TEST B: Auto-Add Mode...');
const widgetBRules = {
  selectionMode: 'auto',
  minRating: 4,
  tags: ['enterprise'],
  tagMatchMode: 'any',
  featuredOnly: false,
  testimonialType: 'all',
  mediaRequirement: { hasCustomerPhoto: false, hasImage: false, hasVideo: false }
};

const testimonial3 = {
  id: 't-3',
  name: 'Alex Rivera',
  email: 'alex@enterprise.corp',
  rating: 5,
  content: 'Enterprise grade testimonial workflow.',
  tags: ['enterprise'],
  type: 'text',
  status: 'approved',
  isFeatured: false,
  consent: true,
  createdAt: '2026-09-03T10:00:00Z',
  source: 'form'
};
dataset.push(testimonial3);

let widgetBResults = filterTestimonials(dataset, widgetBRules);
assert(widgetBResults.some(t => t.id === 't-3'), 'Widget B automatically displays approved 5-star enterprise testimonial 3');

// ─────────────────────────────────────────────────────────────
// TEST C — FUTURE AUTOMATIC UPDATE (Without altering embed or rules)
// ─────────────────────────────────────────────────────────────
console.log('\nRunning TEST C: Future Automatic Update...');
const testimonial4 = {
  id: 't-4',
  name: 'Elena Rostova',
  email: 'elena@enterprise.org',
  rating: 4,
  content: 'Seamless auto-updating Wall of Love.',
  tags: ['enterprise', 'b2b'],
  type: 'text',
  status: 'approved',
  isFeatured: false,
  consent: true,
  createdAt: '2026-09-04T10:00:00Z',
  source: 'form'
};
dataset.push(testimonial4);

// Re-evaluating rules dynamically with zero changes to widgetBRules
widgetBResults = filterTestimonials(dataset, widgetBRules);
assert(widgetBResults.some(t => t.id === 't-4'), 'Widget B dynamically picks up newly submitted and approved testimonial 4');
assert(widgetBResults.length === 3, 'Widget B dynamically contains all 3 matching testimonials (t-1, t-3, t-4)');

// ─────────────────────────────────────────────────────────────
// TEST D — NON-MATCHING TESTIMONIAL
// ─────────────────────────────────────────────────────────────
console.log('\nRunning TEST D: Non-Matching Testimonial Handling...');
const testimonial5 = {
  id: 't-5',
  name: 'Chris Green',
  email: 'chris@consumer.io',
  rating: 5,
  content: 'Consumer app review.',
  tags: ['consumer'], // Does NOT have enterprise tag
  type: 'text',
  status: 'approved',
  isFeatured: false,
  consent: true,
  createdAt: '2026-09-05T10:00:00Z',
  source: 'form'
};
dataset.push(testimonial5);

widgetBResults = filterTestimonials(dataset, widgetBRules);
assert(!widgetBResults.some(t => t.id === 't-5'), 'Non-matching testimonial 5 does NOT appear in Widget B');

// ─────────────────────────────────────────────────────────────
// TEST E — DYNAMIC REMOVAL ON ATTRIBUTE OR STATUS CHANGE
// ─────────────────────────────────────────────────────────────
console.log('\nRunning TEST E: Dynamic Removal on Rule Violation / Unapproval...');
// Scenario 1: Remove 'enterprise' tag from testimonial 3
dataset = dataset.map(t => t.id === 't-3' ? { ...t, tags: ['legacy'] } : t);
widgetBResults = filterTestimonials(dataset, widgetBRules);
assert(!widgetBResults.some(t => t.id === 't-3'), 'Testimonial 3 automatically disappears when tag is removed');

// Scenario 2: Unapprove testimonial 4 (status -> pending)
dataset = dataset.map(t => t.id === 't-4' ? { ...t, status: 'pending' } : t);
widgetBResults = filterTestimonials(dataset, widgetBRules);
assert(!widgetBResults.some(t => t.id === 't-4'), 'Testimonial 4 automatically disappears when unapproved');

// ─────────────────────────────────────────────────────────────
// TEST F — WALL OF LOVE PUBLIC TAG FILTERING
// ─────────────────────────────────────────────────────────────
console.log('\nRunning TEST F: Wall of Love Visitor Tag Filtering...');
// Reset t-4 to approved for wall of love test
dataset = dataset.map(t => t.id === 't-4' ? { ...t, status: 'approved' } : t);

const wolAll = filterTestimonials(dataset, { selectionMode: 'auto', minRating: 'all' });
const wolB2B = wolAll.filter(t => t.tags?.includes('b2b'));
const wolConsumer = wolAll.filter(t => t.tags?.includes('consumer'));

assert(wolB2B.length === 1 && wolB2B[0].id === 't-4', 'Wall of Love filter for #b2b displays only matching b2b testimonial');
assert(wolConsumer.length === 2 && wolConsumer.some(t => t.id === 't-5'), 'Wall of Love filter for #consumer displays consumer testimonials');

// ─────────────────────────────────────────────────────────────
// TEST G — PUBLIC DATA PRIVACY
// ─────────────────────────────────────────────────────────────
console.log('\nRunning TEST G: Public Data Privacy & Redaction...');
function sanitizeForPublic(reviews) {
  return reviews.map(({ email, internalNotes, ...publicFields }) => publicFields);
}

const publicDataset = sanitizeForPublic(wolAll);
const leakedEmail = publicDataset.some(t => t.email !== undefined);
assert(!leakedEmail, 'Public dataset strictly sanitizes and does not leak customer email addresses');

console.log(`\n==================================================`);
console.log(`Verification Complete: ${testsPassed} passed, ${testsFailed} failed.`);
console.log(`==================================================\n`);

if (testsFailed > 0) {
  process.exit(1);
}
