# 🎮 BrawlField — Brawl Stars Strategy & Tools Platform

BrawlField is a comprehensive web platform for Brawl Stars players, providing strategy guides, brawler analytics, team composition tools, and meta insights to help players improve their game.

## 🚀 Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Linting**: ESLint
- **Package Manager**: npm

## 📁 Project Structure

```
BrawlField/
├── app/                    # Next.js App Router (pages & routing)
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page
│   └── globals.css         # Global styles
├── components/
│   ├── ui/                 # Base UI components (buttons, cards, inputs, etc.)
│   ├── features/           # Feature-specific components (brawler cards, match stats, etc.)
│   └── layout/             # Layout components (header, footer, sidebar, etc.)
├── lib/
│   ├── api/                # API client functions (Brawl Stars API integration)
│   └── utils/              # Utility/helper functions
├── types/                  # TypeScript type definitions
├── data/                   # Static data & constants (brawler data, map info, etc.)
├── public/                 # Static assets (images, icons, etc.)
├── .env.example            # Environment variables template
├── .env.local              # Local environment variables (not committed)
├── tsconfig.json           # TypeScript configuration
├── next.config.ts          # Next.js configuration
├── eslint.config.mjs       # ESLint configuration
├── postcss.config.mjs      # PostCSS configuration (Tailwind CSS)
└── package.json            # Dependencies & scripts
```

## 🛠️ Getting Started

### Prerequisites

- Node.js 18.x or later
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/BrawlField.git

# Navigate to the project directory
cd BrawlField

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Fill in your API keys in .env.local
```

### Development

```bash
# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
# Create production build
npm run build

# Start production server
npm start
```

### Linting

```bash
# Run ESLint
npm run lint
```

## 🔑 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `BRAWL_STARS_API_KEY` | Brawl Stars API key from [developer.brawlstars.com](https://developer.brawlstars.com) | Yes |
| `NEXT_PUBLIC_BRAWL_STARS_API_URL` | Brawl Stars API base URL | Yes |
| `NEXT_PUBLIC_APP_URL` | Application URL | Yes |
| `NEXT_PUBLIC_APP_NAME` | Application display name | No |

## 📝 Import Aliases

The project uses TypeScript path aliases for clean imports:

```typescript
// Instead of relative paths:
import { Button } from '../../../components/ui/Button'

// Use the @ alias:
import { Button } from '@/components/ui/Button'
```

## 📄 License

This project is private and not licensed for public use.

## 🗄️ Supabase Database Schema

To set up the Supabase database for BrawlField, run the following SQL commands in the **SQL Editor** of your Supabase project dashboard.

This script creates the necessary tables (`profiles`, `strategies`, `tier_lists`), sets up auto-updating timestamps, and configures Row Level Security (RLS) policies to allow safe guest reads and secure authenticated writes.

```sql
-- ========================================================
-- BrawlField - Supabase Database Schema Setup
-- ========================================================

-- 1. Create Profiles Table (User details mapped to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    avatar_url TEXT DEFAULT 'https://cdn.brawlapi.com/brawlers/borders/16000000.png',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Strategies Table (Tactical canvas board plans)
CREATE TABLE IF NOT EXISTS public.strategies (
    id TEXT PRIMARY KEY, -- Text based keys to support both random text keys and UUIDs
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- Nullable for anonymous/guest creations
    map_id INTEGER NOT NULL,
    map_name TEXT NOT NULL,
    map_image_url TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    canvas_data JSONB DEFAULT '{"lines":[]}'::jsonb, -- Store canvas lines coordinate array
    brawlers_data JSONB DEFAULT '{"placements":[]}'::jsonb, -- Store positioned brawler tokens details
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Tier Lists Table (Brawlers ranked setup)
CREATE TABLE IF NOT EXISTS public.tier_lists (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    tiers_data JSONB DEFAULT '{"S":[],"A":[],"B":[],"C":[],"D":[],"F":[]}'::jsonb, -- Map of ranked tier grades
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================================
-- 4. Enable Row Level Security (RLS)
-- ========================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tier_lists ENABLE ROW LEVEL SECURITY;

-- ========================================================
-- 5. Set RLS Policies
-- ========================================================

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert/update their own profile" 
ON public.profiles FOR ALL USING (auth.uid() = id);

-- Strategies Policies
CREATE POLICY "Strategies are readable by everyone" 
ON public.strategies FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert their own strategies" 
ON public.strategies FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update their own strategies" 
ON public.strategies FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own strategies" 
ON public.strategies FOR DELETE USING (auth.uid() = user_id);

-- Tier Lists Policies
CREATE POLICY "Tier lists are readable by everyone" 
ON public.tier_lists FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert tier lists" 
ON public.tier_lists FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update their own tier lists" 
ON public.tier_lists FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tier lists" 
ON public.tier_lists FOR DELETE USING (auth.uid() = user_id);

-- ========================================================
-- 6. Trigger for Automatic Timestamp Updates (updated_at)
-- ========================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_strategies_updated_at BEFORE UPDATE ON public.strategies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tier_lists_updated_at BEFORE UPDATE ON public.tier_lists FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

