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
