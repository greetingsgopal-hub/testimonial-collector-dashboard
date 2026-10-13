import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { DeveloperDocsPage } from '../DeveloperDocsPage';

describe('DeveloperDocsPage Component (Task 3.5)', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  it('renders API base URL, interactive playground, and code sample controls', async () => {
    const root = createRoot(container);
    await act(async () => {
      root.render(
        <MemoryRouter>
          <DeveloperDocsPage />
        </MemoryRouter>
      );
    });

    expect(container.textContent).toContain('Build with the PandaPraise REST API');
    expect(container.textContent).toContain('https://pandapraise.com/api/v1');
    expect(container.textContent).toContain('Authorization: Bearer pp_live_');
    expect(container.textContent).toContain('Interactive Request Console');
    expect(container.textContent).toContain('/api/v1/testimonials');
    expect(container.textContent).toContain('Slack Block Kit Cards');
    expect(container.textContent).toContain('Discord Embeds');
  });
});
