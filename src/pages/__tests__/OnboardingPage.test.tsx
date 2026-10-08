import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { OnboardingPage } from '../OnboardingPage';

// Mock canvas-confetti
vi.mock('canvas-confetti', () => ({
  default: vi.fn(),
}));

// Mock AuthContext
const mockUpdateProjectDetails = vi.fn().mockResolvedValue(true);
const mockSignOut = vi.fn().mockResolvedValue(true);
let mockUser = { displayName: 'Alex Rivera', email: 'alex@example.com' };
let mockProject = { id: 'proj_123', name: 'Acme SaaS', websiteUrl: 'https://acme.com' };

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
    project: mockProject,
    updateProjectDetails: mockUpdateProjectDetails,
    signOut: mockSignOut,
  }),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('OnboardingPage High-Velocity Setup & Transition Flow', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    vi.useRealTimers();
  });

  it('1. Fast transitions through steps and auto-redirects to dashboard within 1.5 seconds upon completion', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={['/onboarding']}>
          <Routes>
            <Route path="/onboarding" element={<OnboardingPage />} />
          </Routes>
        </MemoryRouter>
      );
    });

    // Advance step 1 confetti timer
    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    // Step 1: Submit name
    const step1Form = container.querySelector('form');
    expect(step1Form).not.toBeNull();
    await act(async () => {
      step1Form?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      vi.advanceTimersByTime(300);
    });

    // Step 2: Choose category and proceed
    const proceedBtn = container.querySelector('#onboarding-step2-proceed-btn') as HTMLButtonElement;
    expect(proceedBtn).not.toBeNull();
    await act(async () => {
      proceedBtn.click();
    });

    // Step 3: Website URL form
    const step3Form = container.querySelector('form');
    expect(step3Form).not.toBeNull();
    await act(async () => {
      step3Form?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });

    // Step 4: Loading & Ready state
    // Advance setup timers across chained promises
    await act(async () => {
      await vi.advanceTimersByTimeAsync(800);
    });

    // Workspace is ready!
    expect(container.textContent).toContain('ready');

    // Auto-redirect should trigger within 1.5s (1500ms) of workspace completion
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1500);
    });

    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  it('2. Features a dominant, high-contrast Proceed to Dashboard focal button', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={['/onboarding']}>
          <Routes>
            <Route path="/onboarding" element={<OnboardingPage />} />
          </Routes>
        </MemoryRouter>
      );
    });

    // Progress directly to step 4
    await act(async () => {
      vi.advanceTimersByTime(300);
    });
    const step1Form = container.querySelector('form');
    await act(async () => {
      step1Form?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      vi.advanceTimersByTime(300);
    });
    const proceedBtn = container.querySelector('#onboarding-step2-proceed-btn') as HTMLButtonElement;
    await act(async () => {
      proceedBtn.click();
    });
    const step3Form = container.querySelector('form');
    await act(async () => {
      step3Form?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      vi.advanceTimersByTime(1200);
    });

    // Check dominant button
    const ctaBtn = container.querySelector('#onboarding-dashboard-cta') as HTMLButtonElement;
    expect(ctaBtn).not.toBeNull();
    expect(ctaBtn.textContent).toMatch(/Dashboard/i);
    // Should have primary high-contrast classes
    expect(ctaBtn.className).toContain('bg-[#6701e6]');
    expect(ctaBtn.className).toContain('text-white');
  });

  it('3. Removes redundant 4 "What Happens Next" card boxes and confusing "See Formats & Plans" link', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={['/onboarding']}>
          <Routes>
            <Route path="/onboarding" element={<OnboardingPage />} />
          </Routes>
        </MemoryRouter>
      );
    });

    // Progress to step 4
    await act(async () => {
      vi.advanceTimersByTime(300);
    });
    const step1Form = container.querySelector('form');
    await act(async () => {
      step1Form?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      vi.advanceTimersByTime(300);
    });
    const proceedBtn = container.querySelector('#onboarding-step2-proceed-btn') as HTMLButtonElement;
    await act(async () => {
      proceedBtn.click();
    });
    const step3Form = container.querySelector('form');
    await act(async () => {
      step3Form?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      vi.advanceTimersByTime(1200);
    });

    // Should NOT contain the 4 cards header
    expect(container.textContent).not.toContain('What happens next');
    // Should NOT contain the 4 separate card titles
    expect(container.textContent).not.toContain('1.Share your collection link');
    expect(container.textContent).not.toContain('2.Approve in your inbox');
    expect(container.textContent).not.toContain('3.Publish anywhere');
    expect(container.textContent).not.toContain('4.Import what you already have');

    // Should NOT have the distracting "See Formats & Plans" link
    expect(container.textContent).not.toContain('See Formats & Plans');
  });
});
