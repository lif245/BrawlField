/**
 * BrawlAPI — Map Endpoints
 * GET /v1/maps
 */

import { apiFetch, type RequestOptions } from './client';
import type { BrawlMap, MapsResponse } from '@/types/map';

/**
 * Fetch all maps.
 */
export async function getAllMaps(
  options?: RequestOptions,
): Promise<BrawlMap[]> {
  const data = await apiFetch<MapsResponse>('/maps', options);
  return data.list;
}

/**
 * Fetch a single map by its numeric ID.
 */
export async function getMapById(
  id: number,
  options?: RequestOptions,
): Promise<BrawlMap | undefined> {
  const maps = await getAllMaps(options);
  return maps.find((m) => m.id === id);
}

/**
 * Get only active (non-disabled) maps.
 */
export async function getActiveMaps(
  options?: RequestOptions,
): Promise<BrawlMap[]> {
  const maps = await getAllMaps(options);
  return maps.filter((m) => !m.disabled);
}

/**
 * Get maps filtered by game mode hash (e.g. 'gem-grab', 'brawl-ball').
 */
export async function getMapsByGameMode(
  gameModeHash: string,
  options?: RequestOptions,
): Promise<BrawlMap[]> {
  const maps = await getAllMaps(options);
  return maps.filter((m) => m.gameMode.hash === gameModeHash);
}

/**
 * Get a list of unique game modes from available maps.
 */
export async function getGameModes(
  options?: RequestOptions,
): Promise<Array<{ id: number; name: string; hash: string }>> {
  const maps = await getAllMaps(options);
  const seen = new Map<number, { id: number; name: string; hash: string }>();

  for (const map of maps) {
    if (!seen.has(map.gameMode.id)) {
      seen.set(map.gameMode.id, {
        id: map.gameMode.id,
        name: map.gameMode.name,
        hash: map.gameMode.hash,
      });
    }
  }

  return Array.from(seen.values());
}
