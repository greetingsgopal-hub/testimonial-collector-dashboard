import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { VerifyEmailPage } from '../VerifyEmailPage';

const mockUser = {
  id: 'user_123',
  uid: 'user_123',
  email: 'founder@example.com',
  emailVerified: false,
};

const mockVerifyEmailWithCode = vi.fn();
const mockSendVerificationEmail = vi.fn();
const mockCheckVerificationStatus = vi.fn();

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
    isEmailVerified: false,
    sendVerificationEmail: mockSendVerificationEmail,
    verifyEmailWithCode: mockVerifyEmailWithCode,
    checkVerificationStatus: mockCheckVerificationStatus,
  }),
}));

describe('VerifyEmailPage Real Funnel Test Suite', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    mockVerifyEmailWithCode.mockReset();
    mockSendVerificationEmail.mockReset();
    mockCheckVerificationStatus.mockReset();
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it('1. Renders the default verification hub displaying user email and steps', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={['/verify-email']}>
          <Routes>
            <Route path="/verify-email" element={<VerifyEmailPage />} />
          </Routes>
        </MemoryRouter>
      );
    });

    expect(container.textContent).toContain('Verify Your Email Address');
    expect(container.textContent).toContain('founder@example.com');
    expect(container.textContent).toContain('Paste Verification Link or Code');
    expect(container.textContent).toContain('Resend Verification Email');
    expect(container.textContent).toContain("I've Verified");
  });

  it('2. Automatically verifies when valid oobCode is passed in URL query', async () => {
    mockVerifyEmailWithCode.mockResolvedValueOnce({ success: true });

    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={['/verify-email?mode=verifyEmail&oobCode=valid_test_code_123']}>
          <Routes>
            <Route path="/verify-email" element={<VerifyEmailPage />} />
          </Routes>
        </MemoryRouter>
      );
    });

    expect(mockVerifyEmailWithCode).toHaveBeenCalledWith('valid_test_code_123');
    expect(container.textContent).toContain('Email Verified Successfully! 🎉');
    expect(container.textContent).toContain('Continue to Dashboard');
  });

  it('3. Shows error state when oobCode is expired or invalid', async () => {
    mockVerifyEmailWithCode.mockResolvedValueOnce({
      success: false,
      error: 'The verification link has expired. Please request a new one.',
    });

    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={['/verify-email?mode=verifyEmail&oobCode=expired_code']}>
          <Routes>
            <Route path="/verify-email" element={<VerifyEmailPage />} />
          </Routes>
        </MemoryRouter>
      );
    });

    expect(mockVerifyEmailWithCode).toHaveBeenCalledWith('expired_code');
    expect(container.textContent).toContain('The verification link has expired');
    expect(container.textContent).toContain('Resend Verification Email');
  });

  it('4. Allows manual pasting of verification link and extracts oobCode', async () => {
    mockVerifyEmailWithCode.mockResolvedValueOnce({ success: true });

    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={['/verify-email']}>
          <Routes>
            <Route path="/verify-email" element={<VerifyEmailPage />} />
          </Routes>
        </MemoryRouter>
      );
    });

    const input = container.querySelector('#manual-verification-code') as HTMLInputElement;
    const form = container.querySelector('form') as HTMLFormElement;

    expect(input).not.toBeNull();
    expect(form).not.toBeNull();

    await act(async () => {
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
      setter?.call(input, 'https://pandapraise.com/__/auth/action?mode=verifyEmail&oobCode=extracted_code_999');
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });

    await act(async () => {
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });

    expect(mockVerifyEmailWithCode).toHaveBeenCalledWith('extracted_code_999');
  });

  it('5. Resending email triggers sendVerificationEmail and activates cooldown', async () => {
    mockSendVerificationEmail.mockResolvedValueOnce({ success: true });

    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={['/verify-email']}>
          <Routes>
            <Route path="/verify-email" element={<VerifyEmailPage />} />
          </Routes>
        </MemoryRouter>
      );
    });

    const resendBtn = container.querySelector('#resend-verification-btn') as HTMLButtonElement;
    expect(resendBtn).not.toBeNull();

    await act(async () => {
      resendBtn.click();
    });

    expect(mockSendVerificationEmail).toHaveBeenCalledTimes(1);
    expect(container.textContent).toContain('Fresh verification email sent!');
    expect(container.textContent).toContain('Resend in 60s');
  });
});
