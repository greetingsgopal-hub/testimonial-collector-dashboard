import 'dotenv/config';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import { getDownloadURL, getMetadata, getStorage, ref } from 'firebase/storage';

const required = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'OWNERSHIP_TEST_VIDEO_ID',
  'OWNERSHIP_OWNER_EMAIL',
  'OWNERSHIP_OWNER_PASSWORD',
  'OWNERSHIP_OTHER_EMAIL',
  'OWNERSHIP_OTHER_PASSWORD',
  'RENDER_E2E_API_URL',
];
const missing = required.filter((name) => !process.env[name]);
if (missing.length) {
  console.error(`Missing required environment variables: ${missing.join(', ')}`);
  process.exit(2);
}

const testimonialId = process.env.OWNERSHIP_TEST_VIDEO_ID.trim();
if (!/^[A-Za-z0-9_-]{1,160}$/.test(testimonialId)) {
  console.error('OWNERSHIP_TEST_VIDEO_ID must be a raw WhatsApp media/testimonial ID.');
  process.exit(2);
}

const app = initializeApp({
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
});
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const expected = {
  '9:16': { width: 1080, height: 1920 },
  '4:5': { width: 1080, height: 1350 },
  '1:1': { width: 1080, height: 1080 },
};

function check(condition, message) {
  if (!condition) throw new Error(message);
  console.log(`PASS ${message}`);
}

async function deniedByStorage(path) {
  try {
    await getMetadata(ref(storage, path));
    return false;
  } catch (error) {
    return error?.code === 'storage/unauthorized';
  }
}

async function main() {
  const ownerCredential = await signInWithEmailAndPassword(
    auth,
    process.env.OWNERSHIP_OWNER_EMAIL,
    process.env.OWNERSHIP_OWNER_PASSWORD,
  );
  const ownerUid = ownerCredential.user.uid;
  const incomingRef = doc(db, 'whatsapp_incoming', `${ownerUid}_${testimonialId}`);
  const incomingSnap = await getDoc(incomingRef);
  check(incomingSnap.exists(), 'owner can read the real incoming WhatsApp record');
  const incoming = incomingSnap.data();
  check(incoming.ownerUid === ownerUid, 'incoming record belongs to the signed-in Firebase UID');
  check(
    typeof incoming.storagePath === 'string' && incoming.storagePath.trim().startsWith(`whatsapp/${ownerUid}/`),
    'source media uses the owner-scoped WhatsApp Storage path',
  );
  const sourceMetadata = await getMetadata(ref(storage, incoming.storagePath.trim()));
  check(Number(sourceMetadata.size) > 0, 'owner can read the real webhook-uploaded source video');

  const idToken = await ownerCredential.user.getIdToken(true);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15 * 60 * 1000);
  let renderResponse;
  try {
    renderResponse = await fetch(process.env.RENDER_E2E_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${idToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ testimonialId }),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
  if (!renderResponse.ok) {
    console.error(`Renderer returned HTTP ${renderResponse.status}; response body is omitted to avoid logging private data.`);
    throw new Error('Owner render request failed.');
  }
  const result = await renderResponse.json();
  check(result?.ok === true, 'authenticated owner render request succeeded');
  check(Array.isArray(result.exports) && result.exports.length === 3, 'renderer returned exactly three aspect ratios');

  const exportDocuments = [];
  for (const ratio of Object.keys(expected)) {
    const output = result.exports.find((item) => item.ratio === ratio);
    check(Boolean(output), `renderer returned ${ratio}`);
    check(
      typeof output.storagePath === 'string' && output.storagePath.startsWith(`edits/${ownerUid}/${testimonialId}/`),
      `${ratio} export path is owner-scoped`,
    );
    const metadata = await getMetadata(ref(storage, output.storagePath));
    check(Number(metadata.size) > 0, `owner can read the ${ratio} export from Firebase Storage`);
    const downloadUrl = await getDownloadURL(ref(storage, output.storagePath));
    check(downloadUrl.startsWith('https://'), `owner can resolve a fresh playback URL for ${ratio}`);

    check(typeof output.id === 'string' && output.id.length > 0, `${ratio} response includes its export record ID`);
    const exportDoc = await getDoc(doc(db, 'video_exports', output.id));
    check(exportDoc.exists(), `owner can read the ${ratio} video_exports record`);
    const exportData = exportDoc.data();
    check(exportData.ownerUid === ownerUid, `${ratio} Firestore export has the authenticated owner UID`);
    check(exportData.status === 'done' && exportData.ratio === ratio, `${ratio} export metadata records completion and ratio`);
    check(
      exportData.width === expected[ratio].width && exportData.height === expected[ratio].height,
      `${ratio} export has ${expected[ratio].width}x${expected[ratio].height} dimensions`,
    );
    check(Number(exportData.videoBitrate) >= 6_000_000, `${ratio} export passes the 6 Mbps FFprobe quality lock`);
    exportDocuments.push({ id: exportDoc.id, storagePath: output.storagePath });
  }

  await signOut(auth);
  const otherCredential = await signInWithEmailAndPassword(
    auth,
    process.env.OWNERSHIP_OTHER_EMAIL,
    process.env.OWNERSHIP_OTHER_PASSWORD,
  );
  const otherToken = await otherCredential.user.getIdToken(true);
  const crossAccountResponse = await fetch(process.env.RENDER_E2E_API_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${otherToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ testimonialId }),
  });
  check(crossAccountResponse.status === 404, 'another account cannot render or enumerate the owner video');

  let incomingDenied = false;
  try {
    await getDoc(incomingRef);
  } catch (error) {
    incomingDenied = error?.code === 'permission-denied';
  }
  check(incomingDenied, 'another account is denied Firestore access to the incoming record');

  for (const output of exportDocuments) {
    check(await deniedByStorage(output.storagePath), 'another account is denied Storage access to a rendered export');
    let exportDenied = false;
    try {
      await getDoc(doc(db, 'video_exports', output.id));
    } catch (error) {
      exportDenied = error?.code === 'permission-denied';
    }
    check(exportDenied, 'another account is denied Firestore access to a rendered export');
  }

  console.log('Renderer end-to-end verification passed. No credentials, tokens, phone numbers, or media URLs were printed.');
}

try {
  await main();
} catch (error) {
  console.error(`Renderer end-to-end verification failed (${error?.code || error?.name || 'Error'}).`);
  process.exitCode = 1;
} finally {
  await signOut(auth).catch(() => {});
  await app.delete();
}
