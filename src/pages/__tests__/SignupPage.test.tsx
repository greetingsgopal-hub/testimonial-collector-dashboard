import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { SignupPage } from '../SignupPage';

const mockSignUp = vi.fn().mockResolvedValue({ success: true });
const mockSignInWithGoogle = vi.fn().mockResolvedValue({ success: true });
const mockSignOut = vi.fn().mockResolvedValue(undefined);

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    signUp: mockSignUp,
    signInWithGoogle: mockSignInWithGoogle,
    signOut: mockSignOut,
    project: null,
    collectionForm: null,
  }),
}));

vi.mock('../../lib/seo', () => ({
  usePageSeo: vi.fn(),
}));

function setNativeTextValue(input: HTMLInputElement, value: string) {
  const descriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
  descriptor?.set?.call(input, value);
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

describe('SignupPage Security & Compliance', () => {
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

  it('renders required consent checkbox linking to Terms and Privacy Policy', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={['/signup']}>
          <SignupPage />
        </MemoryRouter>
      );
    });

    const checkbox = container.querySelector('#agreeToTerms') as HTMLInputElement;
    expect(checkbox).not.toBeNull();
    expect(checkbox.type).toBe('checkbox');
    expect(container.textContent).toContain('Terms of Service and Privacy Policy');
  });

  it('blocks submission and shows error if terms consent checkbox is unchecked', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={['/signup']}>
          <SignupPage />
        </MemoryRouter>
      );
    });

    const emailInput = container.querySelector('input[type="email"]') as HTMLInputElement;
    const passwordInput = container.querySelector('input[type="password"]') as HTMLInputElement;
    const form = container.querySelector('form') as HTMLFormElement;

    await act(async () => {
      setNativeTextValue(emailInput, 'user@example.com');
      setNativeTextValue(passwordInput, 'Secret123!');
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });

    expect(container.textContent).toContain('Please check the box below to agree to the Terms of Service and Privacy Policy');
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it('strictly blocks Google sign-up and highlights terms when consent checkbox is unchecked', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={['/signup']}>
          <SignupPage />
        </MemoryRouter>
      );
    });

    // Find the Google button
    const googleBtn = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('Sign up with Google')
    );
    expect(googleBtn).not.toBeUndefined();

    // Click Google button without checking terms
    await act(async () => {
      googleBtn!.click();
    });

    expect(mockSignInWithGoogle).not.toHaveBeenCalled();
    expect(container.textContent).toContain('Please check the box below to agree to the Terms of Service and Privacy Policy');
    expect(container.textContent).toContain('You must check this box to agree before creating your account');

    // Now check the terms box
    const checkbox = container.querySelector('#agreeToTerms') as HTMLInputElement;
    await act(async () => {
      checkbox.click();
    });

    // Click Google button again - now it should succeed
    await act(async () => {
      googleBtn!.click();
    });

    expect(mockSignInWithGoogle).toHaveBeenCalledTimes(1);
  });

  it('blocks submission and displays password policy error when password is under 8 chars or lacks complexity', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={['/signup']}>
          <SignupPage />
        </MemoryRouter>
      );
    });

    const emailInput = container.querySelector('input[type="email"]') as HTMLInputElement;
    const passwordInput = container.querySelector('input[type="password"]') as HTMLInputElement;
    const checkbox = container.querySelector('#agreeToTerms') as HTMLInputElement;
    const form = container.querySelector('form') as HTMLFormElement;

    // Check terms
    await act(async () => {
      checkbox.click();
    });

    // Test < 8 chars
    await act(async () => {
      setNativeTextValue(emailInput, 'user@example.com');
      setNativeTextValue(passwordInput, 'short1');
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });

    expect(container.textContent).toContain('Password must be at least 8 characters long');
    expect(mockSignUp).not.toHaveBeenCalled();

    // Test lack of numbers/symbols
    await act(async () => {
      setNativeTextValue(passwordInput, 'alllettersonly');
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });

    expect(container.textContent).toContain('Password must contain at least one letter and one number or special character');
    expect(mockSignUp).not.toHaveBeenCalled();
  });
});
