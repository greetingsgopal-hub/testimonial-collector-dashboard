import { describe, it, expect } from 'vitest';
import { VideoEditService, RATIO_SPECS } from '../videoEditService';

describe('Phase 13: VideoEditService & Quality Lock', () => {
  it('provides exact Meta Ads standard aspect ratio dimensions', () => {
    expect(RATIO_SPECS['9:16']).toMatchObject({ width: 1080, height: 1920, label: '9:16 Reels / Stories' });
    expect(RATIO_SPECS['4:5']).toMatchObject({ width: 1080, height: 1350, label: '4:5 Feed Ad' });
    expect(RATIO_SPECS['1:1']).toMatchObject({ width: 1080, height: 1080, label: '1:1 Square Feed' });
  });

  it('Quality Lock blocks export if CRF > 20 (Quality is too low)', () => {
    const audit = VideoEditService.auditQuality({
      crf: 23,
      bitrate: '10M',
      duration: 9.0,
      ratio: '9:16'
    });

    expect(audit.isTopNotchReady).toBe(false);
    expect(audit.crfValid).toBe(false);
    expect(audit.message).toContain('Quality Lock Violation: CRF must be 20 or lower');
  });

  it('Quality Lock blocks export if bitrate < 6M', () => {
    const audit = VideoEditService.auditQuality({
      crf: 18,
      bitrate: '4M',
      duration: 9.0,
      ratio: '9:16'
    });

    expect(audit.isTopNotchReady).toBe(false);
    expect(audit.bitrateValid).toBe(false);
    expect(audit.message).toContain('Bitrate must be at least 6 Mbps');
  });

  it('Quality Lock approves export when CRF <= 20 and bitrate >= 6M', () => {
    const audit = VideoEditService.auditQuality({
      crf: 18,
      bitrate: '10M',
      duration: 9.0,
      ratio: '9:16'
    });

    expect(audit.isTopNotchReady).toBe(true);
    expect(audit.crfValid).toBe(true);
    expect(audit.bitrateValid).toBe(true);
    expect(audit.message).toContain('✓ Top Notch Ready');
  });

  it('exportVideo rejects with Quality Lock error if quality standards fail', async () => {
    await expect(
      VideoEditService.exportVideo({
        videoId: 'vid_test',
        startTime: 0,
        duration: 9.0,
        ratio: '9:16',
        hookText: 'POV: TEST',
        crf: 24, // Invalid CRF > 20
        bitrate: '10M'
      })
    ).rejects.toThrow('Quality Lock Blocked');
  });
});
