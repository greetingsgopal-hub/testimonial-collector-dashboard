import { getFreshUrl } from "../firebase-adapters/firebase";

/**
 * Thin wrapper exported for component convenience.
 * Returns a fresh download URL for a given storage path.
 */
export const getFreshDownloadUrl = (path: string): Promise<string> => {
  return getFreshUrl(path);
};

