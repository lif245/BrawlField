import fs from "fs";
import path from "path";
import type { Strategy, TierList, MockUser } from "./supabase";

const DB_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DB_DIR, "mock_db.json");

interface MockDatabaseSchema {
  profiles: MockUser[];
  strategies: Strategy[];
  tierLists: TierList[];
}

// Initial state of the mock database
const initialData: MockDatabaseSchema = {
  profiles: [
    {
      id: "mock-user-1",
      email: "brawlstar_pro@gmail.com",
      name: "LeonPro99",
      avatar_url: "https://cdn.brawlapi.com/brawlers/borders/16000010.png",
      created_at: new Date().toISOString(),
    },
  ],
  strategies: [
    {
      id: "mock-strategy-1",
      user_id: "mock-user-1",
      map_id: 15000014,
      map_name: "Sneaky Fields",
      map_image_url: "https://cdn.brawlapi.com/maps/ld/15000014.png",
      title: "Aggressive Lane Push Team Setup",
      description: "Push heavy brawlers through the left bushes. El Primo holds center while Shelly ambushes from the sneaky fields on the flank.",
      canvas_data: {
        lines: [
          { points: [{ x: 50, y: 150 }, { x: 50, y: 400 }], color: "#F7D33A", width: 4 },
          { points: [{ x: 450, y: 150 }, { x: 450, y: 400 }], color: "#3498DB", width: 4 },
        ],
      },
      brawlers_data: {
        placements: [
          { id: 16000000, name: "Shelly", x: 60, y: 350, role: "Flanker" },
          { id: 16000004, name: "El Primo", x: 250, y: 400, role: "Gem Carrier / Tank" },
          { id: 16000008, name: "Brock", x: 440, y: 350, role: "Long Range Support" },
        ],
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  tierLists: [
    {
      id: "mock-tierlist-1",
      user_id: "mock-user-1",
      title: "Brawl Ball Meta - Season 25",
      description: "Rankings of all brawlers for standard Brawl Ball maps based on the current tank meta and hypercharges.",
      tiers_data: {
        S: [16000004, 16000012, 16000020], // El Primo, Barley, Bull
        A: [16000000, 16000008], // Shelly, Brock
        B: [16000016], // Colt
        C: [],
        D: [],
        F: [],
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
};

function readDb(): MockDatabaseSchema {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }

    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), "utf8");
      return initialData;
    }

    const data = fs.readFileSync(DB_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Failed to read mock database file, using in-memory fallback:", error);
    return initialData;
  }
}

function writeDb(data: MockDatabaseSchema) {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf8");
  } catch (error) {
    console.error("Failed to write to mock database file:", error);
  }
}

export const mockDb = {
  // Profiles CRUD
  getProfiles(): MockUser[] {
    return readDb().profiles;
  },
  getProfile(id: string): MockUser | undefined {
    return readDb().profiles.find((p) => p.id === id);
  },
  saveProfile(profile: MockUser): MockUser {
    const db = readDb();
    const idx = db.profiles.findIndex((p) => p.id === profile.id || p.email === profile.email);
    if (idx >= 0) {
      db.profiles[idx] = { ...db.profiles[idx], ...profile };
    } else {
      db.profiles.push(profile);
    }
    writeDb(db);
    return profile;
  },

  // Strategies CRUD
  getStrategies(userId?: string | null): Strategy[] {
    const strategies = readDb().strategies;
    if (userId) {
      return strategies.filter((s) => s.user_id === userId);
    }
    return strategies;
  },
  getStrategy(id: string): Strategy | undefined {
    return readDb().strategies.find((s) => s.id === id);
  },
  saveStrategy(strategy: Omit<Strategy, "created_at" | "updated_at"> & { created_at?: string; updated_at?: string }): Strategy {
    const db = readDb();
    const now = new Date().toISOString();
    const idx = db.strategies.findIndex((s) => s.id === strategy.id);
    
    let savedStrategy: Strategy;
    
    if (idx >= 0) {
      savedStrategy = {
        ...db.strategies[idx],
        ...strategy,
        updated_at: now,
      } as Strategy;
      db.strategies[idx] = savedStrategy;
    } else {
      savedStrategy = {
        ...strategy,
        created_at: strategy.created_at || now,
        updated_at: now,
      } as Strategy;
      db.strategies.push(savedStrategy);
    }
    
    writeDb(db);
    return savedStrategy;
  },
  deleteStrategy(id: string): boolean {
    const db = readDb();
    const originalLen = db.strategies.length;
    db.strategies = db.strategies.filter((s) => s.id !== id);
    writeDb(db);
    return db.strategies.length < originalLen;
  },

  // Tier Lists CRUD
  getTierLists(userId?: string | null): TierList[] {
    const lists = readDb().tierLists;
    if (userId) {
      return lists.filter((l) => l.user_id === userId);
    }
    return lists;
  },
  getTierList(id: string): TierList | undefined {
    return readDb().tierLists.find((l) => l.id === id);
  },
  saveTierList(tierList: Omit<TierList, "created_at" | "updated_at"> & { created_at?: string; updated_at?: string }): TierList {
    const db = readDb();
    const now = new Date().toISOString();
    const idx = db.tierLists.findIndex((l) => l.id === tierList.id);
    
    let savedList: TierList;
    
    if (idx >= 0) {
      savedList = {
        ...db.tierLists[idx],
        ...tierList,
        updated_at: now,
      } as TierList;
      db.tierLists[idx] = savedList;
    } else {
      savedList = {
        ...tierList,
        created_at: tierList.created_at || now,
        updated_at: now,
      } as TierList;
      db.tierLists.push(savedList);
    }
    
    writeDb(db);
    return savedList;
  },
  deleteTierList(id: string): boolean {
    const db = readDb();
    const originalLen = db.tierLists.length;
    db.tierLists = db.tierLists.filter((l) => l.id !== id);
    writeDb(db);
    return db.tierLists.length < originalLen;
  },
};
