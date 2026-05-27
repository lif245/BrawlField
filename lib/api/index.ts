/**
 * BrawlField API
 * Re-export all API functions for convenient access
 */

// Base client
export { apiFetch, BrawlApiError } from './client';
export type { RequestOptions } from './client';

// Brawler functions
export {
  getAllBrawlers,
  getBrawlerById,
  getBrawlerByName,
  getReleasedBrawlers,
} from './brawlers';

// Map functions
export {
  getAllMaps,
  getMapById,
  getActiveMaps,
  getMapsByGameMode,
  getGameModes,
} from './maps';

// Event functions
export {
  getEvents,
  getActiveEvents,
  getUpcomingEvents,
  getIcons,
  getIconsByBrawler,
} from './events';
