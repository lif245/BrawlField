/**
 * BrawlAPI — Event & Icon Endpoints
 * GET /v1/events
 * GET /v1/icons
 */

import { apiFetch, type RequestOptions } from './client';
import type {
  GameEvent,
  EventsResponse,
  IconsResponse,
  PlayerIcon,
} from '@/types/event';

/**
 * Fetch the current event rotation (active + upcoming).
 */
export async function getEvents(
  options?: RequestOptions,
): Promise<EventsResponse> {
  return apiFetch<EventsResponse>('/events', options);
}

/**
 * Fetch only currently active events.
 */
export async function getActiveEvents(
  options?: RequestOptions,
): Promise<GameEvent[]> {
  const data = await getEvents(options);
  return data.active;
}

/**
 * Fetch only upcoming events.
 */
export async function getUpcomingEvents(
  options?: RequestOptions,
): Promise<GameEvent[]> {
  const data = await getEvents(options);
  return data.upcoming;
}

/**
 * Fetch all player icons.
 */
export async function getIcons(
  options?: RequestOptions,
): Promise<Record<string, PlayerIcon>> {
  const data = await apiFetch<IconsResponse>('/icons', options);
  return data.player;
}

/**
 * Fetch icons associated with a specific brawler ID.
 */
export async function getIconsByBrawler(
  brawlerId: number,
  options?: RequestOptions,
): Promise<PlayerIcon[]> {
  const icons = await getIcons(options);
  return Object.values(icons).filter((icon) => icon.brawler === brawlerId);
}
