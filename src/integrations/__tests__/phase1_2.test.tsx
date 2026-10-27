import { describe, it, expect } from 'vitest';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ShopifyConnect } from '../shopify/ShopifyConnect';
import { WhatsAppCollect } from '../whatsapp/WhatsAppCollect';
import { Workflow_01_02_03 } from '../../pages/Workflow_01_02_03';

describe('Phase 1 & 2: Connect + Collect Workflow Suite', () => {
  it('ShopifyConnect renders 47s setup and 1-click OAuth button', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(<ShopifyConnect />);
    });

    expect(container.textContent).toContain('01');
    expect(container.textContent).toContain('OAUTH • 1-CLICK');
    expect(container.textContent).toContain('CONNECT');
    expect(container.textContent).toContain('Shopify in 47s');
    expect(container.textContent).toContain('Connect Shopify Store');

    root.unmount();
    container.remove();
  });

  it('WhatsAppCollect renders incoming customer videos and import CTA', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(
        <BrowserRouter>
          <WhatsAppCollect />
        </BrowserRouter>
      );
    });

    expect(container.textContent).toContain('02');
    expect(container.textContent).toContain('WHATSAPP UI • INCOMING');
    expect(container.textContent).toContain('COLLECT');
    expect(container.textContent).toContain('Customers reply with video on WhatsApp. No app, no link.');
    expect(container.textContent).toContain('Ananya S.');
    expect(container.textContent).toContain('Rahul M.');
    expect(container.textContent).toContain('Import to Inbox →');

    root.unmount();
    container.remove();
  });

  it('Workflow_01_02_03 renders end-to-end 01 -> 02 -> 03 flow', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(
        <BrowserRouter>
          <Workflow_01_02_03 />
        </BrowserRouter>
      );
    });

    expect(container.textContent).toContain('PandaPraise Workflow • 01 → 02 → 03');
    expect(container.textContent).toContain('CONNECT');
    expect(container.textContent).toContain('COLLECT');
    expect(container.textContent).toContain('EDIT');
    expect(container.textContent).toContain('Open Phase 13 Video Editor');
    expect(container.textContent).toContain('Cloudflare Queue delay 7 days');

    root.unmount();
    container.remove();
  });
});
