import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { AboutPage } from '../AboutPage';
import { ContactPage } from '../ContactPage';
import { RoadmapPage } from '../RoadmapPage';
import { BlogPage } from '../BlogPage';

vi.mock('../../lib/seo', () => ({
  usePageSeo: vi.fn(),
}));

describe('Trust Layer Pages', () => {
  it('renders AboutPage with legal entity and contact info', () => {
    const html = renderToString(
      <MemoryRouter>
        <AboutPage />
      </MemoryRouter>
    );

    expect(html).toContain('About Panda Praise');
    expect(html).toContain('Panda Praise Technologies');
    expect(html).toContain('Bengaluru, Karnataka');
    expect(html).toContain('support@pandapraise.com');
  });

  it('renders ContactPage with support categories and grievance officer details', () => {
    const html = renderToString(
      <MemoryRouter>
        <ContactPage />
      </MemoryRouter>
    );

    expect(html).toContain('Contact Panda Praise');
    expect(html).toContain('General &amp; Technical Support');
    expect(html).toContain('Privacy &amp; Data Requests');
    expect(html).toContain('Grievance Officer');
  });

  it('renders RoadmapPage with Live, In Development, and Planned columns', () => {
    const html = renderToString(
      <MemoryRouter>
        <RoadmapPage />
      </MemoryRouter>
    );

    expect(html).toContain('Product Roadmap');
    expect(html).toContain('Live Today');
    expect(html).toContain('In Development');
    expect(html).toContain('Planned Next');
  });

  it('renders BlogPage with starter engineering posts', () => {
    const html = renderToString(
      <MemoryRouter>
        <BlogPage />
      </MemoryRouter>
    );

    expect(html).toContain('The Panda Praise Blog');
    expect(html).toContain('How to Collect Testimonials Without Annoying Your Customers');
    expect(html).toContain('Displaying Social Proof Without Slowing Down Your Website');
  });
});
