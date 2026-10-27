import { describe, it, expect } from 'vitest';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ShopifyConnect_Firebase } from '../shopify/ShopifyConnect_Firebase';
import { WhatsAppCollect_Firebase } from '../whatsapp/WhatsAppCollect_Firebase';
import { Edit_Firebase } from '../edit/Edit_Firebase';
import { ScreenshotWorkflow_Firebase } from '../../pages/ScreenshotWorkflow_Firebase';

describe('PandaPraise - Firebase Solid Base Suite', () => {
  it('ShopifyConnect_Firebase renders 01 CONNECT, OAuth in 47s, and Connect button', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(<ShopifyConnect_Firebase />);
    });

    expect(container.textContent).toContain('01');
    expect(container.textContent).toContain('OAUTH • 1-CLICK');
    expect(container.textContent).toContain('CONNECT');
    expect(container.textContent).toContain('Shopify in 47s');
    expect(container.textContent).toContain('Connect Shopify Store');

    root.unmount();
    container.remove();
  });

  it('WhatsAppCollect_Firebase renders 02 COLLECT with real-time incoming video list', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(<WhatsAppCollect_Firebase />);
    });

    expect(container.textContent).toContain('02');
    expect(container.textContent).toContain('WHATSAPP UI • INCOMING');
    expect(container.textContent).toContain('COLLECT');
    expect(container.textContent).toContain('Customers reply with video on WhatsApp. No app, no link.');
    expect(container.textContent).toContain('Ananya S.');
    expect(container.textContent).toContain('Rahul M.');

    root.unmount();
    container.remove();
  });

  it('Edit_Firebase renders 03 EDIT with hook detection 0-3s and 3 ratios', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(<Edit_Firebase />);
    });

    expect(container.textContent).toContain('03');
    expect(container.textContent).toContain('HOOKS + RATIOS');
    expect(container.textContent).toContain('EDIT');
    expect(container.textContent).toContain('Hook Detection');
    expect(container.textContent).toContain('0.0s → 3.1s');
    expect(container.textContent).toContain('Auto-Edit • Top Notch 10M');

    root.unmount();
    container.remove();
  });

  it('ScreenshotWorkflow_Firebase renders full 3-card layout and Firebase collections', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(
        <BrowserRouter>
          <ScreenshotWorkflow_Firebase />
        </BrowserRouter>
      );
    });

    expect(container.textContent).toContain('PandaPraise • Firebase Solid Base • 01 → 02 → 03');
    expect(container.textContent).toContain('Firebase Collections');
    expect(container.textContent).toContain('Firebase Storage');
    expect(container.textContent).toContain('Quality Lock - Top Notch');
    expect(container.textContent).toContain('CRF 18 slow preset');

    root.unmount();
    container.remove();
  });
});
