/**
 * BrawlAPI Base Client
 *
 * Base URL: https://api.brawlapi.com/v1
 * Auth: None required (public API)
 * Rate Limits: No documented rate limits
 */

const BASE_URL = 'https://api.brawlapi.com/v1';

/** Custom error class for API errors */
export class BrawlApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly endpoint: string,
  ) {
    super(message);
    this.name = 'BrawlApiError';
  }
}

/** Options for API requests */
export interface RequestOptions {
  /** AbortSignal for request cancellation */
  signal?: AbortSignal;
  /** Custom headers to merge */
  headers?: Record<string, string>;
  /** Cache mode */
  cache?: RequestCache;
  /** Next.js revalidation (seconds), only used with Next.js fetch */
  revalidate?: number;
}

/**
 * Generic fetch wrapper for BrawlAPI endpoints.
 *
 * @param endpoint - The API path (e.g. '/brawlers')
 * @param options  - Optional request configuration
 * @returns Parsed JSON response typed as T
 * @throws {BrawlApiError} When the API returns a non-OK status
 */
export async function apiFetch<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;

  const fetchOptions: RequestInit & { next?: { revalidate: number } } = {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      ...options.headers,
    },
    signal: options.signal,
    cache: options.cache,
  };

  // Support Next.js ISR revalidation
  if (options.revalidate !== undefined) {
    fetchOptions.next = { revalidate: options.revalidate };
  }

  let response: Response;

  try {
    response = await fetch(url, fetchOptions);
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw error; // Let abort errors propagate as-is
    }
    throw new BrawlApiError(
      `Network error fetching ${endpoint}: ${error instanceof Error ? error.message : String(error)}`,
      500,
      endpoint
    );
  }

  if (!response.ok) {
    throw new BrawlApiError(
      `BrawlAPI error: ${response.status} ${response.statusText}`,
      response.status,
      endpoint
    );
  }

  return response.json() as Promise<T>;
}