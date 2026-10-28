import { describe, it, expect, vi } from 'vitest';
import { saveWhatsAppVideo } from '../../../server/services/whatsappStorage.js';

describe('saveWhatsAppVideo Service', () => {
  it('saves videoBuffer to Firebase Storage path and saves storagePath to Firestore without videoUrl', async () => {
    const mockSave = vi.fn().mockResolvedValue(true);
    const mockFile = vi.fn(() => ({ save: mockSave }));
    const mockBucket = { file: mockFile };

    const mockSet = vi.fn().mockResolvedValue(true);
    const mockDoc = vi.fn(() => ({ set: mockSet }));
    const mockCollection = vi.fn(() => ({ doc: mockDoc }));
    const mockDb = { collection: mockCollection };

    const mockTimestamp = { _seconds: 123456 };
    const mockFieldValue = { serverTimestamp: () => mockTimestamp };

    const phone = '+919876543210';
    const id = 'wamid_video_999';
    const videoBuffer = Buffer.from('mock video bytes');

    const result = await saveWhatsAppVideo({
      bucket: mockBucket,
      db: mockDb,
      FieldValue: mockFieldValue,
      phone,
      id,
      videoBuffer
    });

    expect(mockFile).toHaveBeenCalledWith(`whatsapp/${phone}/${id}.mp4`);
    expect(mockSave).toHaveBeenCalledWith(videoBuffer);
    expect(mockCollection).toHaveBeenCalledWith('whatsapp_incoming');
    expect(mockDoc).toHaveBeenCalledWith(id);

    expect(mockSet).toHaveBeenCalledWith({
      phone,
      storagePath: `whatsapp/${phone}/${id}.mp4`,
      createdAt: mockTimestamp
    });

    // Explicitly verify videoUrl is NOT saved
    const savedData = mockSet.mock.calls[0][0];
    expect(savedData.videoUrl).toBeUndefined();
    expect(savedData.storagePath).toBe(`whatsapp/${phone}/${id}.mp4`);

    expect(result).toEqual({
      storagePath: `whatsapp/${phone}/${id}.mp4`,
      id,
      phone
    });
  });
});
