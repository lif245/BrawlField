/**
 * BrawlAPI Event Types
 * Based on https://api.brawlapi.com/v1/events
 */

/** Compact map info inside an event */
export interface EventMap {
  id: number;
  name: string;
}

/** Compact game mode info inside an event */
export interface EventMode {
  id: number;
  name: string;
  hash: string;
  color: string;
}

/** Single Event (active or upcoming) */
export interface GameEvent {
  slot: number;
  map: EventMap | null;
  mode: EventMode | null;
  startTime: string;
  endTime: string;
}

/** Response from GET /v1/events */
export interface EventsResponse {
  active: GameEvent[];
  upcoming: GameEvent[];
}

/**
 * BrawlAPI Icon Types
 * Based on https://api.brawlapi.com/v1/icons
 */

/** Single player icon */
export interface PlayerIcon {
  id: number;
  name: string;
  name2: string;
  imageUrl: string;
  brawler: number | null;
}

/** Response from GET /v1/icons */
export interface IconsResponse {
  player: Record<string, PlayerIcon>;
}
