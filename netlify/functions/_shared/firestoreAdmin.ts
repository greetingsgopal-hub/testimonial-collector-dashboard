/**
 * Serverless Firestore REST API client.
 * Uses caller ID token to enforce multi-tenant security rules.
 */

const PROJECT_ID = process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || 'testimonialcollectordashboard';
const FIRESTORE_BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

/**
 * Converts a JS object into Firestore REST API value format.
 */
function toFirestoreValue(val: any): any {
  if (val === null || val === undefined) return { nullValue: null };
  if (typeof val === 'string') return { stringValue: val };
  if (typeof val === 'boolean') return { booleanValue: val };
  if (typeof val === 'number') {
    return Number.isInteger(val) ? { integerValue: val.toString() } : { doubleValue: val };
  }
  if (Array.isArray(val)) {
    return { arrayValue: { values: val.map(toFirestoreValue) } };
  }
  if (typeof val === 'object') {
    const fields: Record<string, any> = {};
    for (const [k, v] of Object.entries(val)) {
      if (v !== undefined) fields[k] = toFirestoreValue(v);
    }
    return { mapValue: { fields } };
  }
  return { stringValue: String(val) };
}

/**
 * Converts a Firestore REST API document format to a standard JS object.
 */
function fromFirestoreFields(fields: Record<string, any>): any {
  const result: Record<string, any> = {};
  for (const [key, val] of Object.entries(fields)) {
    if ('stringValue' in val) result[key] = val.stringValue;
    else if ('integerValue' in val) result[key] = parseInt(val.integerValue, 10);
    else if ('doubleValue' in val) result[key] = val.doubleValue;
    else if ('booleanValue' in val) result[key] = val.booleanValue;
    else if ('nullValue' in val) result[key] = null;
    else if ('timestampValue' in val) result[key] = val.timestampValue;
    else if ('arrayValue' in val) {
      result[key] = (val.arrayValue.values || []).map((v: any) => fromFirestoreFields({ val: v }).val);
    } else if ('mapValue' in val) {
      result[key] = fromFirestoreFields(val.mapValue.fields || {});
    }
  }
  return result;
}

export async function getDocument(collectionName: string, docId: string, idToken?: string): Promise<any | null> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (idToken) headers['Authorization'] = `Bearer ${idToken}`;

  const res = await fetch(`${FIRESTORE_BASE}/${collectionName}/${docId}`, { headers });
  if (res.status === 404) return null;
  if (!res.ok) {
    console.warn(`[Firestore] Failed to get ${collectionName}/${docId}:`, res.status);
    return null;
  }
  const data = await res.json();
  return {
    id: docId,
    ...fromFirestoreFields(data.fields || {}),
  };
}

export async function saveDocument(collectionName: string, docId: string, data: Record<string, any>, idToken?: string): Promise<void> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (idToken) headers['Authorization'] = `Bearer ${idToken}`;

  const fields: Record<string, any> = {};
  for (const [k, v] of Object.entries(data)) {
    if (v !== undefined) fields[k] = toFirestoreValue(v);
  }

  const url = `${FIRESTORE_BASE}/${collectionName}/${docId}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ fields }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error(`[Firestore] Failed to save ${collectionName}/${docId}:`, res.status, errText);
    throw new Error(`Firestore save failed: ${res.status}`);
  }
}

export async function deleteDocument(collectionName: string, docId: string, idToken?: string): Promise<void> {
  const headers: Record<string, string> = {};
  if (idToken) headers['Authorization'] = `Bearer ${idToken}`;

  const res = await fetch(`${FIRESTORE_BASE}/${collectionName}/${docId}`, {
    method: 'DELETE',
    headers,
  });

  if (!res.ok && res.status !== 404) {
    console.error(`[Firestore] Failed to delete ${collectionName}/${docId}:`, res.status);
    throw new Error(`Firestore delete failed: ${res.status}`);
  }
}

export async function queryUserDocuments(collectionName: string, ownerId: string, idToken?: string): Promise<any[]> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (idToken) headers['Authorization'] = `Bearer ${idToken}`;

  const queryUrl = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents:runQuery`;
  const body = {
    structuredQuery: {
      from: [{ collectionId: collectionName }],
      where: {
        fieldFilter: {
          field: { fieldPath: 'ownerId' },
          op: 'EQUAL',
          value: { stringValue: ownerId },
        },
      },
    },
  };

  const res = await fetch(queryUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    console.warn(`[Firestore] Query ${collectionName} failed:`, res.status);
    return [];
  }

  const rawList = await res.json();
  const results: any[] = [];
  for (const item of rawList) {
    if (item.document) {
      const parts = item.document.name.split('/');
      const id = parts[parts.length - 1];
      results.push({
        id,
        ...fromFirestoreFields(item.document.fields || {}),
      });
    }
  }
  return results;
}
