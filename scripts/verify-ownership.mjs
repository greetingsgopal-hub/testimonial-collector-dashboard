import 'dotenv/config';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import { getMetadata, getStorage, ref } from 'firebase/storage';

const required = [
  'VITE_FIREBASE_API_KEY', 'VITE_FIREBASE_AUTH_DOMAIN', 'VITE_FIREBASE_PROJECT_ID', 'VITE_FIREBASE_STORAGE_BUCKET',
  'OWNERSHIP_TEST_WABA_ID', 'OWNERSHIP_TEST_VIDEO_ID',
  'OWNERSHIP_OWNER_EMAIL', 'OWNERSHIP_OWNER_PASSWORD', 'OWNERSHIP_OTHER_EMAIL', 'OWNERSHIP_OTHER_PASSWORD',
];
const missing = required.filter((key) => !process.env[key]);
if (missing.length) {
  console.error(`Missing required environment variables: ${missing.join(', ')}`);
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
const check = (condition, message) => {
  if (!condition) throw new Error(message);
  console.log(`PASS ${message}`);
};

try {
  const ownerCredential = await signInWithEmailAndPassword(auth, process.env.OWNERSHIP_OWNER_EMAIL, process.env.OWNERSHIP_OWNER_PASSWORD);
  const ownerUid = ownerCredential.user.uid;
  const wabaId = process.env.OWNERSHIP_TEST_WABA_ID;
  const videoId = process.env.OWNERSHIP_TEST_VIDEO_ID;

  const accountSnap = await getDoc(doc(db, 'whatsapp_accounts', wabaId));
  check(accountSnap.exists(), 'owner can read linked WABA mapping');
  const account = accountSnap.data();
  check(account.ownerUid === ownerUid && account.verified === true && account.verifiedVia === 'per_user_meta_oauth', 'mapping belongs to the signed-in owner and records per-user verification');
  check(typeof account.accessTokenEncrypted === 'undefined', 'WABA mapping does not expose the Meta access token');
  let privateConnectionDenied = false;
  try { await getDoc(doc(db, 'whatsapp_meta_connections', ownerUid)); }
  catch (error) { privateConnectionDenied = error?.code === 'permission-denied'; }
  check(privateConnectionDenied, 'owner cannot read the private encrypted Meta token document');

  const incomingSnap = await getDoc(doc(db, 'whatsapp_incoming', `${ownerUid}_${videoId}`));
  check(incomingSnap.exists(), 'owner can read the incoming WhatsApp record');
  const incoming = incomingSnap.data();
  check(incoming.ownerUid === ownerUid, 'incoming record ownerUid matches Firebase Auth UID');
  check(incoming.storagePath?.startsWith(`whatsapp/${ownerUid}/`), 'video path is namespaced by owner UID');
  const metadata = await getMetadata(ref(storage, incoming.storagePath));
  check(Number(metadata.size) > 0, 'owner can read metadata for the uploaded video');

  await signOut(auth);
  await signInWithEmailAndPassword(auth, process.env.OWNERSHIP_OTHER_EMAIL, process.env.OWNERSHIP_OTHER_PASSWORD);
  let firestoreDenied = false;
  try { await getDoc(doc(db, 'whatsapp_incoming', incomingSnap.id)); }
  catch (error) { firestoreDenied = error?.code === 'permission-denied'; }
  check(firestoreDenied, 'different user is denied Firestore access to the video record');

  let storageDenied = false;
  try { await getMetadata(ref(storage, incoming.storagePath)); }
  catch (error) { storageDenied = error?.code === 'storage/unauthorized'; }
  check(storageDenied, 'different user is denied Storage access to the video');
  console.log('Ownership verification passed.');
} catch (error) {
  console.error(`Ownership verification failed: ${error?.message || 'unknown error'}`);
  process.exitCode = 1;
} finally {
  await signOut(auth).catch(() => {});
  await app.delete();
}

