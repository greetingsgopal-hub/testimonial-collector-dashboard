import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { LoginPage } from '../LoginPage';

// Mock AuthContext
const mockSignIn = vi.fn().mockResolvedValue({ success: true });
const mockSignInWithGoogle = vi.fn().mockResolvedValue({ success: true });

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    signIn: mockSignIn,
    signInWithGoogle: mockSignInWithGoogle,
    authError: null,
  }),
}));

// Mock SEO
vi.mock('../../lib/seo', () => ({
  usePageSeo: vi.fn(),
}));

describe('LoginPage - Modern Distraction-Free Auth Redesign', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
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
  });

  it('1. Renders prominent Google Sign-in above email/password fields', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={['/login']}>
          <LoginPage />
        </MemoryRouter>
      );
    });

    const googleBtn = container.querySelector('#google-signin-btn');
    expect(googleBtn).not.toBeNull();
    expect(googleBtn?.textContent).toContain('Sign in with Google');

    const divider = container.querySelector('.uppercase');
    expect(divider?.textContent).toContain('Or continue with email');

    // Google button should appear before the form in the DOM
    const form = container.querySelector('form');
    expect(googleBtn!.compareDocumentPosition(form!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('2. Inputs have clear labels and forgot password link is placed beneath password box', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={['/login']}>
          <LoginPage />
        </MemoryRouter>
      );
    });

    const emailInput = container.querySelector('#login-email') as HTMLInputElement;
    const passwordInput = container.querySelector('#login-password') as HTMLInputElement;
    const forgotPasswordLink = container.querySelector('#forgot-password-link');

    expect(emailInput).not.toBeNull();
    expect(passwordInput).not.toBeNull();
    expect(forgotPasswordLink).not.toBeNull();
    expect(forgotPasswordLink?.getAttribute('href')).toBe('/forgot-password');

    // Forgot password link is placed after the password input in the DOM
    expect(passwordInput.compareDocumentPosition(forgotPasswordLink!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('3. Renders welcoming signup bottom prompt', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={['/login']}>
          <LoginPage />
        </MemoryRouter>
      );
    });

    const signupLink = container.querySelector('#signup-prompt-link');
    expect(signupLink).not.toBeNull();
    expect(signupLink?.textContent).toContain('Sign up for free');
    expect(signupLink?.getAttribute('href')).toBe('/signup');
    expect(container.textContent).toContain("Don't have an account?");
  });

  it('4. Right pane displays customer success quote and value statement (no distracting feature stack)', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={['/login']}>
          <LoginPage />
        </MemoryRouter>
      );
    });

    // Value statement
    expect(container.textContent).toContain('Turn customer praise into your highest-converting sales asset.');

    // Customer success quote
    expect(container.textContent).toContain('Sarah Jenkins');
    expect(container.textContent).toContain('Head of Growth at OrbitSaaS');
    expect(container.textContent).toContain('Conversion on our SaaS landing page jumped by 32%');

    // Trust metrics
    expect(container.textContent).toContain('4,200+ Testimonials Collected');
    expect(container.textContent).toContain('99.9% Widget Uptime');
  });

  it('5. Submitting valid email and password triggers signIn', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={['/login']}>
          <LoginPage />
        </MemoryRouter>
      );
    });

    const emailInput = container.querySelector('#login-email') as HTMLInputElement;
    const passwordInput = container.querySelector('#login-password') as HTMLInputElement;
    const form = container.querySelector('form') as HTMLFormElement;

    const nativeInputSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      'value'
    )?.set;

    await act(async () => {
      nativeInputSetter?.call(emailInput, 'user@example.com');
      emailInput.dispatchEvent(new Event('input', { bubbles: true }));
      nativeInputSetter?.call(passwordInput, 'secret123');
      passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
    });

    await act(async () => {
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });

    expect(mockSignIn).toHaveBeenCalledWith('user@example.com', 'secret123');
  });

  it('6. Clicking Google button triggers signInWithGoogle', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={['/login']}>
          <LoginPage />
        </MemoryRouter>
      );
    });

    const googleBtn = container.querySelector('#google-signin-btn') as HTMLButtonElement;

    await act(async () => {
      googleBtn.click();
    });

    expect(mockSignInWithGoogle).toHaveBeenCalledTimes(1);
  });
});
