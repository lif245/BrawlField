/**
 * BrawlAPI Brawler Types
 * Based on https://api.brawlapi.com/v1/brawlers
 */

/** Brawler class/role categorization */
export interface BrawlerClass {
  id: number;
  name: string;
}

/** Brawler rarity tier */
export interface BrawlerRarity {
  id: number;
  name: string;
  color: string;
}

/** Star Power ability */
export interface StarPower {
  id: number;
  name: string;
  path: string;
  version: number;
  description: string;
  descriptionHtml: string;
  imageUrl: string;
  released: boolean;
}

/** Gadget ability */
export interface Gadget {
  id: number;
  name: string;
  path: string;
  version: number;
  description: string;
  descriptionHtml: string;
  imageUrl: string;
  released: boolean;
}

/** Video associated with a brawler */
export interface BrawlerVideo {
  type: number;
  name: string;
  videoUrl: string;
}

/** Single Brawler entity */
export interface Brawler {
  id: number;
  avatarId: number;
  name: string;
  hash: string;
  path: string;
  fankit: string;
  released: boolean;
  version: number;
  link: string;
  imageUrl: string;
  imageUrl2: string;
  imageUrl3: string;
  class: BrawlerClass;
  rarity: BrawlerRarity;
  unlock: string | null;
  description: string;
  descriptionHtml: string;
  starPowers: StarPower[];
  gadgets: Gadget[];
  videos: BrawlerVideo[];
}

/** Response from GET /v1/brawlers */
export interface BrawlersResponse {
  list: Brawler[];
}
