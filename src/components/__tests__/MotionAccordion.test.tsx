import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { MotionAccordion, MotionAccordionItem } from '../MotionAccordion';

describe('MotionAccordion Component', () => {
  let container: HTMLDivElement;
  let root: Root;

  const sampleItems: MotionAccordionItem[] = [
    {
      question: 'What is Panda Praise?',
      answer: 'Panda Praise is the all-in-one social proof operating system for modern internet businesses.',
    },
    {
      question: 'How do I collect video testimonials?',
      answer: 'Share your public collector link or embed the collector widget on your site to record videos in 60 seconds.',
    },
  ];

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it('renders all accordion items with their questions', async () => {
    await act(async () => {
      root.render(<MotionAccordion items={sampleItems} />);
    });

    expect(container.textContent).toContain('What is Panda Praise?');
    expect(container.textContent).toContain('How do I collect video testimonials?');
  });

  it('starts with items collapsed and expands on click', async () => {
    await act(async () => {
      root.render(<MotionAccordion items={sampleItems} />);
    });

    const buttons = container.querySelectorAll('button');
    expect(buttons.length).toBe(2);
    expect(buttons[0].getAttribute('aria-expanded')).toBe('false');

    // Click first item to expand
    await act(async () => {
      buttons[0].click();
    });

    expect(buttons[0].getAttribute('aria-expanded')).toBe('true');
    expect(container.textContent).toContain('social proof operating system');

    // Click again to collapse
    await act(async () => {
      buttons[0].click();
    });

    expect(buttons[0].getAttribute('aria-expanded')).toBe('false');
  });

  it('switches between items when clicking another question', async () => {
    await act(async () => {
      root.render(<MotionAccordion items={sampleItems} />);
    });

    const buttons = container.querySelectorAll('button');

    await act(async () => {
      buttons[0].click();
    });
    expect(buttons[0].getAttribute('aria-expanded')).toBe('true');
    expect(buttons[1].getAttribute('aria-expanded')).toBe('false');

    await act(async () => {
      buttons[1].click();
    });
    expect(buttons[0].getAttribute('aria-expanded')).toBe('false');
    expect(buttons[1].getAttribute('aria-expanded')).toBe('true');
  });

  it('links trigger and panel via accessible ARIA attributes', async () => {
    await act(async () => {
      root.render(<MotionAccordion items={sampleItems} />);
    });

    const firstButton = container.querySelector('button');
    expect(firstButton).not.toBeNull();
    const panelId = firstButton!.getAttribute('aria-controls');
    expect(panelId).toBeTruthy();

    const panel = container.querySelector(`#${panelId}`);
    expect(panel).not.toBeNull();
    expect(panel?.getAttribute('role')).toBe('region');
    expect(panel?.getAttribute('aria-labelledby')).toBe(firstButton!.id);
  });
});
