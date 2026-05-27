/**
 * BrawlAPI — Brawler Endpoints
 * GET /v1/brawlers
 */

import { apiFetch, type RequestOptions } from './client';
import type { Brawler, BrawlersResponse } from '@/types/brawler';

/**
 * Fetch all brawlers.
 */
export async function getAllBrawlers(
  options?: RequestOptions,
): Promise<Brawler[]> {
  const data = await apiFetch<BrawlersResponse>('/brawlers', options);
  return data.list;
}

/**
 * Fetch a single brawler by its numeric ID.
 * Falls back to client-side filtering from the full list because
 * BrawlAPI does not expose a single-brawler endpoint.
 */
export async function getBrawlerById(
  id: number,
  options?: RequestOptions,
): Promise<Brawler | undefined> {
  const brawlers = await getAllBrawlers(options);
  return brawlers.find((b) => b.id === id);
}

/**
 * Fetch a single brawler by name (case-insensitive).
 */
export async function getBrawlerByName(
  name: string,
  options?: RequestOptions,
): Promise<Brawler | undefined> {
  const brawlers = await getAllBrawlers(options);
  const lower = name.toLowerCase();
  return brawlers.find((b) => b.name.toLowerCase() === lower);
}

/**
 * Get only released brawlers.
 */
export async function getReleasedBrawlers(
  options?: RequestOptions,
): Promise<Brawler[]> {
  const brawlers = await getAllBrawlers(options);
  return brawlers.filter((b) => b.released);
}
