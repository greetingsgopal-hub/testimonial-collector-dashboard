/**
 * AI Case Study Generator — Takes a collection of testimonials and generates
 * a structured case study document from them.
 *
 * In production, this would use an LLM API. For now, we use template-based generation.
 */
import { Review } from '../types';

export interface CaseStudy {
  id: string;
  title: string;
  subtitle: string;
  customerName: string;
  customerCompany: string;
  customerRole: string;
  challenge: string;
  solution: string;
  results: string[];
  testimonialQuotes: { content: string; author: string; role: string }[];
  generatedAt: string;
  wordCount: number;
}

/**
 * Generate a case study from a set of related testimonials.
 * Groups by company/author and synthesizes key themes.
 */
export function generateCaseStudy(
  reviews: Review[],
  projectName: string,
  companyFilter?: string
): CaseStudy {
  // Filter reviews by company if specified
  const targetReviews = companyFilter
    ? reviews.filter(r => r.company?.toLowerCase().includes(companyFilter.toLowerCase()))
    : reviews.filter(r => r.status === 'approved' && r.rating >= 4);

  if (targetReviews.length === 0) {
    return createEmptyCaseStudy(projectName);
  }

  // Determine primary customer
  const primaryReview = targetReviews[0];
  const company = primaryReview.company || 'Our Customer';
  const role = primaryReview.role || 'User';
  const name = primaryReview.name;

  // Extract themes from testimonial content
  const allContent = targetReviews.map(r => r.content).join(' ').toLowerCase();
  const themes = extractThemes(allContent);

  // Build case study sections
  const title = `How ${company} ${themes.outcome} with ${projectName}`;
  const subtitle = `A ${company} success story`;

  const challenge = generateChallenge(themes, company);
  const solution = generateSolution(themes, projectName, company);
  const results = generateResults(themes, targetReviews);

  const quotes = targetReviews.slice(0, 3).map(r => ({
    content: r.content,
    author: r.name,
    role: [r.role, r.company].filter(Boolean).join(' at '),
  }));

  const fullText = [title, subtitle, challenge, solution, ...results, ...quotes.map(q => q.content)].join(' ');

  return {
    id: `cs_${Date.now()}`,
    title,
    subtitle,
    customerName: name,
    customerCompany: company,
    customerRole: role,
    challenge,
    solution,
    results,
    testimonialQuotes: quotes,
    generatedAt: new Date().toISOString(),
    wordCount: fullText.split(/\s+/).length,
  };
}

// ── Theme Extraction ────────────────────────────────────────
interface ThemeSet {
  painPoints: string[];
  benefits: string[];
  outcome: string;
  industry: string;
}

function extractThemes(text: string): ThemeSet {
  const painPoints: string[] = [];
  const benefits: string[] = [];

  // Pain point detection
  if (text.includes('slow') || text.includes('time-consuming')) painPoints.push('time-consuming manual processes');
  if (text.includes('expensive') || text.includes('cost')) painPoints.push('rising operational costs');
  if (text.includes('complicated') || text.includes('complex')) painPoints.push('complex workflows');
  if (text.includes('manual') || text.includes('spreadsheet')) painPoints.push('manual data management');
  if (text.includes('scale') || text.includes('growing')) painPoints.push('scaling challenges');
  if (painPoints.length === 0) painPoints.push('operational inefficiencies');

  // Benefit detection
  if (text.includes('fast') || text.includes('quick') || text.includes('speed')) benefits.push('dramatically faster workflows');
  if (text.includes('easy') || text.includes('simple') || text.includes('intuitive')) benefits.push('simplified operations');
  if (text.includes('save') || text.includes('time')) benefits.push('significant time savings');
  if (text.includes('team') || text.includes('collaborate')) benefits.push('improved team collaboration');
  if (text.includes('grow') || text.includes('revenue') || text.includes('sales')) benefits.push('accelerated growth');
  if (text.includes('automat') || text.includes('streamline')) benefits.push('automated key processes');
  if (benefits.length === 0) benefits.push('improved overall efficiency');

  // Outcome
  const outcomes = [
    'Transformed Their Workflow', 'Accelerated Growth', 'Streamlined Operations',
    'Boosted Productivity', 'Scaled Successfully', 'Achieved Their Goals',
  ];
  const outcome = outcomes[Math.floor(Math.random() * outcomes.length)];

  return { painPoints, benefits, outcome, industry: 'Technology' };
}

// ── Section Generators ──────────────────────────────────────
function generateChallenge(themes: ThemeSet, company: string): string {
  return `Before adopting the platform, ${company} faced several challenges including ${themes.painPoints.slice(0, 2).join(' and ')}. ` +
    `Like many growing organizations, they needed a solution that could scale with their needs while remaining easy to use. ` +
    `${themes.painPoints.length > 2 ? `Additional pain points included ${themes.painPoints.slice(2).join(', ')}.` : ''}`;
}

function generateSolution(themes: ThemeSet, productName: string, company: string): string {
  return `${company} chose ${productName} as their go-to solution. The implementation was smooth and the team quickly saw results. ` +
    `Key benefits they experienced include ${themes.benefits.slice(0, 3).join(', ')}. ` +
    `The platform's flexibility allowed them to customize their workflow to match their exact needs.`;
}

function generateResults(themes: ThemeSet, reviews: Review[]): string[] {
  const results: string[] = [];
  const avgRating = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;

  results.push(`${Math.round(avgRating * 20)}% customer satisfaction score across ${reviews.length} team members`);

  if (themes.benefits.includes('significant time savings')) {
    results.push('Reduced time spent on manual processes by an estimated 60%');
  }
  if (themes.benefits.includes('simplified operations')) {
    results.push('Streamlined onboarding with intuitive interface — minimal training needed');
  }
  if (themes.benefits.includes('accelerated growth')) {
    results.push('Contributed to measurable business growth within the first quarter');
  }

  results.push('Successfully adopted across the entire team');

  return results;
}

function createEmptyCaseStudy(projectName: string): CaseStudy {
  return {
    id: `cs_empty_${Date.now()}`,
    title: `Success Story with ${projectName}`,
    subtitle: 'Select reviews to generate a case study',
    customerName: '',
    customerCompany: '',
    customerRole: '',
    challenge: 'Collect more approved testimonials to auto-generate case study content.',
    solution: '',
    results: [],
    testimonialQuotes: [],
    generatedAt: new Date().toISOString(),
    wordCount: 0,
  };
}

/**
 * Format a case study as Markdown for export.
 */
export function caseStudyToMarkdown(cs: CaseStudy): string {
  const lines: string[] = [];

  lines.push(`# ${cs.title}`);
  lines.push(`*${cs.subtitle}*`);
  lines.push('');
  lines.push(`**Customer:** ${cs.customerName}, ${cs.customerRole} at ${cs.customerCompany}`);
  lines.push('');
  lines.push('## The Challenge');
  lines.push(cs.challenge);
  lines.push('');
  lines.push('## The Solution');
  lines.push(cs.solution);
  lines.push('');

  if (cs.results.length > 0) {
    lines.push('## Key Results');
    for (const r of cs.results) {
      lines.push(`- ✅ ${r}`);
    }
    lines.push('');
  }

  if (cs.testimonialQuotes.length > 0) {
    lines.push('## What They Said');
    for (const q of cs.testimonialQuotes) {
      lines.push(`> "${q.content}"`);
      lines.push(`> — **${q.author}**, ${q.role}`);
      lines.push('');
    }
  }

  lines.push('---');
  lines.push(`*Generated on ${new Date(cs.generatedAt).toLocaleDateString()}*`);

  return lines.join('\n');
}
