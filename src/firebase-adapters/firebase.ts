// Firebase solid base - uses your existing Firebase project configuration
import { db, storage, auth } from '../lib/firebase';
import { getStorage, ref, getDownloadURL } from "firebase/storage";

export { db, storage, auth };

export const getFreshUrl = async (path: string) => {
  const storageInst = storage || getStorage();
  const urlRef = ref(storageInst, path);
  // Always generate fresh — expires in 1 week, but we refresh on every load
  return await getDownloadURL(urlRef);
};

// Collections used for screenshot workflow 01-02-03
export const COLLECTIONS = {
  shops: 'shops', // 01 CONNECT - Shopify tokens
  testimonials: 'testimonials', // 02 COLLECT + 03 EDIT
  whatsapp_incoming: 'whatsapp_incoming', // 02 COLLECT
  whatsapp_triggers: 'whatsapp_triggers', // 7-day trigger queue
  video_exports: 'video_exports', // 03 EDIT exports
} as const;

export default { db, storage, auth, getFreshUrl, COLLECTIONS };
