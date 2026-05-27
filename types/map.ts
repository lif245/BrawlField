/**
 * BrawlAPI Map Types
 * Based on https://api.brawlapi.com/v1/maps
 */

/** Map environment/theme */
export interface MapEnvironment {
  id: number;
  scId: number;
  name: string;
  hash: string;
  path: string;
  version: number;
  imageUrl: string;
}

/** Game mode associated with a map */
export interface GameMode {
  id: number;
  scId: number;
  name: string;
  hash: string;
  version: number;
  color: string;
  bgColor: string;
  link: string;
  imageUrl: string;
}

/** Single Map entity */
export interface BrawlMap {
  id: number;
  new: boolean;
  disabled: boolean;
  name: string;
  hash: string;
  version: number;
  link: string;
  imageUrl: string;
  credit: string | null;
  environment: MapEnvironment;
  gameMode: GameMode;
  lastActive: number | null;
  dataUpdated: number;
}

/** Response from GET /v1/maps */
export interface MapsResponse {
  list: BrawlMap[];
}
