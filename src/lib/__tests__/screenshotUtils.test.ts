import { describe, it, expect } from 'vitest';
import { detectScreenshotPlatform, detectChatPlatform, ScreenshotPlatform } from '../screenshotUtils';

describe('detectScreenshotPlatform', () => {
  it('detects WhatsApp from filename or text', () => {
    expect(detectScreenshotPlatform('WhatsApp Image 2026-10-01.png')).toBe('whatsapp');
    expect(detectScreenshotPlatform('wa_chat_export.jpg')).toBe('whatsapp');
    expect(detectScreenshotPlatform('customer chat review.png')).toBe('whatsapp');
  });

  it('detects Twitter / X from hints', () => {
    expect(detectScreenshotPlatform('twitter_dm.png')).toBe('twitter');
    expect(detectScreenshotPlatform('tweet_praise.jpg')).toBe('twitter');
    expect(detectScreenshotPlatform('x.com_screenshot.png')).toBe('twitter');
  });

  it('detects Instagram from hints', () => {
    expect(detectScreenshotPlatform('instagram_story.png')).toBe('instagram');
    expect(detectScreenshotPlatform('insta_dm.png')).toBe('instagram');
    expect(detectScreenshotPlatform('ig_message.png')).toBe('instagram');
  });

  it('detects Slack from hints', () => {
    expect(detectScreenshotPlatform('slack_shoutout.png')).toBe('slack');
  });

  it('detects iMessage from hints', () => {
    expect(detectScreenshotPlatform('imessage_convo.png')).toBe('imessage');
    expect(detectScreenshotPlatform('ios_text.jpg')).toBe('imessage');
  });

  it('detects Stripe from revenue/payout hints', () => {
    expect(detectScreenshotPlatform('stripe_notification.png')).toBe('stripe');
    expect(detectScreenshotPlatform('payout_alert.png')).toBe('stripe');
    expect(detectScreenshotPlatform('revenue_milestone.png')).toBe('stripe');
  });

  it('detects Email from inbox hints', () => {
    expect(detectScreenshotPlatform('email_forward.png')).toBe('email');
    expect(detectScreenshotPlatform('gmail_review.png')).toBe('email');
    expect(detectScreenshotPlatform('inbox_praise.png')).toBe('email');
  });

  it('falls back to other for unknown filenames', () => {
    expect(detectScreenshotPlatform('random_file_001.png')).toBe('other');
  });

  it('detectChatPlatform alias works identically', () => {
    expect(detectChatPlatform('whatsapp_review.png')).toBe('whatsapp');
    expect(detectChatPlatform('slack_review.png')).toBe('slack');
  });
});
