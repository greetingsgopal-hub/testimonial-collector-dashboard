// src/worker/lib/adapter.ts

/**
 * Request sent to the ImportEngine to import testimonials from a provider.
 */
export interface ImportRequest {
  /** Provider identifier, e.g., 'google', 'facebook' */
  providerId: string;
  /** Provider‑specific parameters such as placeId, pageUrl, etc. */
  params: Record<string, any>;
  /** Optional auth token for provider OAuth (e.g. Google/Facebook OAuth access token) */
  authToken?: string;
  /** Firebase Auth ID token representing the authenticated Panda Praise caller */
  firebaseIdToken?: string;
}

/**
 * Result returned by the ImportEngine after processing an ImportRequest.
 */
export interface ImportResult {
  /** Overall status of the import operation */
  status: 'success' | 'error';
  /** Number of imported testimonials (zero is valid) */
  importedCount: number;
  /** Normalized testimonial objects */
  reviews?: any[];
  /** Human‑readable error message when status is 'error' */
  error?: string;
}

/**
 * Contract that each provider adapter must implement. Methods are optional when the
 * provider does not support the corresponding capability (as declared in the
 * ProviderRegistry). The ImportEngine will invoke only the methods that are
 * applicable for the selected provider.
 */
export interface ProviderAdapter {
  /**
   * OPTIONAL – Perform any authentication steps (e.g., OAuth exchange).
   */
  authenticate?(request: ImportRequest): Promise<void>;

  /**
   * OPTIONAL – Discover available resources for the provider (e.g., list of
   * Google Business locations, Facebook pages). Returns an array of raw resource
   * descriptors.
   */
  discoverResources?(request: ImportRequest): Promise<any[]>;

  /**
   * OPTIONAL – Given a list of discovered resources, select the one that should
   * be used for the import. This may involve UI‑driven selection or heuristic
   * choice. Returns the selected resource.
   */
  selectResource?(resources: any[], request: ImportRequest): Promise<any>;

  /**
   * Core fetch – Retrieve raw testimonial data from the provider. Implementations
   * may assume that any required authentication has already been performed.
   */
  fetch(request: ImportRequest): Promise<any>;

  /**
   * Normalization – Convert the raw provider data into the canonical testimonial
   * shape expected by the rest of the system.
   */
  normalize(rawData: any): any[];

  /**
   * OPTIONAL – Indicates whether the provider supports background auto‑sync after
   * an initial successful import.
   */
  supportsAutoSync?(): boolean;

  /**
   * OPTIONAL – Disconnect or revoke credentials for the provider.
   */
  disconnect?(request: ImportRequest): Promise<void>;

  /**
   * OPTIONAL – Map provider‑specific errors to a standardized error code/message.
   */
  mapError?(error: any): string;
}
