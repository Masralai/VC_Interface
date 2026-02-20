# Scout AI — VC Intelligence Interface

A precision AI scout for venture capital: discover companies, enrich profiles with live web data, manage lists, and save searches. Built with Next.js, Firecrawl, and Google Gemini.

## Features

- **App shell**: Sidebar navigation + global quick search (navigates to companies with query)
- **Companies** (`/companies`): Search, stage filter, sortable table, pagination (10 per page)
- **Company profile** (`/companies/[id]`): Overview, signals timeline, team notes, save-to-list, **live enrichment**
- **Lists** (`/lists`): Create lists, add/remove companies, export as **CSV or JSON**, view list detail
- **Saved searches** (`/saved`): Save and re-run searches (persisted in localStorage)
- **Live enrichment**: On a company profile, click **Enrich** to scrape the company website via Firecrawl and extract summary, bullets, keywords, and signals with Gemini. Sources and timestamps are shown. Results are cached in localStorage.

All list and saved-search data is persisted in **localStorage** (no backend DB required).

## Setup

### Prerequisites

- Node.js 18+
- npm / yarn / pnpm

### Install

```bash
git clone <repo-url>
cd VC_Interface
npm install
```

### Environment variables

Create a `.env` or `.env.local` in the project root with:

```env
# Required for Live Enrichment (company profile → Enrich)
FIRECRAWL_API_KEY=your_firecrawl_api_key
GEMINI_API_KEY=your_google_gemini_api_key
```

- **FIRECRAWL_API_KEY**: From [Firecrawl](https://firecrawl.dev) — used to scrape public company websites.
- **GEMINI_API_KEY**: From [Google AI Studio](https://aistudio.google.com/apikey) — used to extract structured intelligence from scraped content.

**Important**: Enrichment runs only on the server (`/api/enrich`). API keys are never exposed to the browser.

### Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build

```bash
npm run build
npm run start
```

## Deploy (Vercel)

1. Push the repo to GitHub.
2. In [Vercel](https://vercel.com), import the repository.
3. Add environment variables in **Project → Settings → Environment Variables**:
   - `FIRECRAWL_API_KEY`
   - `GEMINI_API_KEY`
4. Deploy. The app will use the same env vars in production.

**Netlify** is also acceptable: add the same env vars in Site settings → Environment variables, and use the default Next.js build command and publish directory.

## CI/CD (GitHub Actions)

The repo includes a workflow in [`.github/workflows/ci-cd.yml`](.github/workflows/ci-cd.yml) that runs on every push and pull request to `main` / `master`:

- **CI**: install deps, `npm run lint`, `npm run build`. No secrets required.
- **CD (optional)**: after CI passes, on push to `main`/`master` a **Deploy to Vercel** job runs. It requires these repository secrets (Settings → Secrets and variables → Actions):
  - `VERCEL_TOKEN` — [Vercel token](https://vercel.com/account/tokens)
  - `VERCEL_ORG_ID` — Team or user ID from [Vercel → Settings → General](https://vercel.com/account)
  - `VERCEL_PROJECT_ID` — Project ID from the project’s Settings → General

If you prefer to deploy only via Vercel’s GitHub integration (no Actions secrets), remove the `deploy` job from `.github/workflows/ci-cd.yml` and keep the `ci` job for lint and build.

## Project structure

- `src/app/` — App Router pages and API routes
- `src/app/api/enrich/` — Server-side enrichment (Firecrawl + Gemini)
- `src/components/` — UI (Sidebar, shadcn/ui)
- `src/lib/` — Utils and localStorage helpers
- `src/data/companies.json` — Seed companies

## License

Private / assignment project.
