# Post Oak Banking — Dashboard MVP

> A modern, responsive retail-banking dashboard built as a technical case study for **Post Oak Group**.

**🚀 Live demo:** [post-oak-banking-frontend.vercel.app](https://post-oak-banking-frontend.vercel.app/), deployed on Vercel

Post Oak Banking is a frontend MVP that gives retail customers a clear, real-time picture of their finances: balances across accounts, how money is moving in and out, and a searchable history of every transaction, plus simulated core banking actions such as sending money and adding funds.

The application is built with React and TypeScript on Vite, styled with Tailwind CSS and shadcn/ui, and charts its data with Recharts. All data currently comes from a mock service layer designed to be swapped for a real backend with no changes to the UI.

---

## Table of Contents

- [Live Demo](https://post-oak-banking-frontend.vercel.app/)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture & Design Decisions](#architecture--design-decisions)
- [Project Structure](#project-structure)
- [AI-Assisted Development](#ai-assisted-development)
- [Trade-offs & Next Steps](#trade-offs--next-steps)
- [How to Run Locally](#how-to-run-locally)

---

## Features

### Responsive layout
- Fixed sidebar navigation on desktop that highlights the section currently in view; slide-out drawer navigation on mobile.
- Sticky header with quick actions, consistent rounded containers, and fluid grids from phone (~400px) to wide desktop.
- Skeleton loading states for every section and subtle micro-interactions (hover lifts, animated transitions, toast notifications).

### Account Overview
- **Total balance** across all accounts, with the change over the last 30 days.
- **Available vs. held funds**: pending debits are reserved as holds and deducted from the available balance.
- **Per-account cards** (checking and savings) showing ledger, available, and held amounts.
- **Monthly summary**: money in, money out, net saved, and savings rate, compared against the *same days of the previous month* so a partial month is never measured against a full one.

### Transaction Table with filtering
- **Instant search** across merchant, category, reference, and amount.
- **Quick filters**: All, Income, Expenses.
- **Status badges** for `POSTED` and `PENDING`, conveyed by icon and label, not color alone.
- **Detail drawer** on click, with account, category, note, and a copyable bank reference.
- Pagination ("Show more") and a friendly empty state with one-click filter reset.

### Cash Flow visualization
- Interactive income-vs-expenses area chart with smooth curves and translucent gradient fills.
- **Timeframe switcher**: 7D and 30D (daily) and 90D (weekly buckets).
- Hover tooltip with exact income, expenses, and net for each period.
- Accessibility: colorblind-safe palette, a screen-reader data table, and support for `prefers-reduced-motion`.

### Banking actions (simulated)
- **Send Money** and **Add Funds** dialogs with validation (including available-balance checks), processing and success states, and toast confirmations.
- New transactions appear instantly as `PENDING`, move funds from *available* to *held*, and automatically post after a short simulated settlement window.

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| UI library | [React 19](https://react.dev/) |
| Language | [TypeScript](https://www.typescriptlang.org/) |
| Build tool | [Vite](https://vite.dev/) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) |
| Components | [shadcn/ui](https://ui.shadcn.com/) (on [Base UI](https://base-ui.com/) primitives) |
| Charts | [Recharts](https://recharts.org/) |
| Icons | [Lucide](https://lucide.dev/) |
| Linting | [Oxlint](https://oxc.rs/docs/guide/usage/linter) |

---

## Architecture & Design Decisions

### Atomic Design via shadcn/ui
The UI is layered following Atomic Design principles:

- **Atoms**: shadcn/ui primitives in `src/components/ui` (button, input, badge, skeleton, dialog, sheet…). They are owned by the codebase rather than imported from a black-box package, so they can be restyled and extended freely.
- **Molecules**: small composites built from atoms, such as `StatusBadge`, `TrendIndicator`, `SearchInput`, and `TransactionRow`.
- **Organisms**: self-contained dashboard sections such as `BalanceHero`, `MonthlySummary`, `CashFlowChart`, and `TransactionHistory`.
- **Templates and pages**: `Layout` provides the application shell, and `DashboardPage` composes the organisms.

### Modular, service-based architecture
The codebase separates concerns so each layer can evolve independently:

```
UI components  →  hooks (useBanking)  →  state (Context + reducer)  →  services  →  [mock data | future REST API]
```

- **Services** (`src/services`) are the only layer that knows where data comes from. Every function returns a `Promise` with simulated network latency, mirroring a real HTTP client. Integrating the backend means replacing these implementations with `fetch` calls; components, hooks, and state stay untouched.
- **State** (`src/state`) is a single source of truth built on React Context and `useReducer`. State and actions are exposed through separate contexts, so components that only trigger actions don't re-render on data changes.
- **Domain logic** (`src/lib/finance.ts`) holds pure, framework-agnostic functions (balance derivation, monthly comparisons, cash-flow bucketing, filtering) that are easy to unit-test.
- **Derived data over duplicated data**: held and available balances are computed from pending transactions rather than stored, so they can never drift out of sync.
- **Responsive search**: the search input updates synchronously while filtering runs through `useDeferredValue`, so typing never blocks on rendering results.
- **Shared types** (`src/types`) define the contract between the UI and the future API.

---

## Project Structure

```
src/
├── components/
│   ├── ui/                  # shadcn/ui primitives (atoms)
│   ├── layout/              # App shell: sidebar, header, mobile nav
│   └── dashboard/
│       ├── overview/        # Balance hero, account cards, monthly summary
│       ├── transactions/    # Search, filters, rows, detail drawer
│       ├── actions/         # Send Money / Add Funds dialogs
│       └── CashFlowChart.tsx
├── hooks/                   # useBanking, usePrefersReducedMotion
├── lib/                     # Domain logic, formatting, utilities
├── pages/                   # Page-level composition
├── services/                # Data access layer (mock API)
├── state/                   # Context, provider, reducer
└── types/                   # Shared domain types
```

---

## AI-Assisted Development

This project was built with **[Claude Code](https://claude.com/claude-code)**, Anthropic's agentic coding tool, powered by **Claude Opus 5.5**. It was used extensively as an AI pair-programmer to accelerate delivery of the MVP without compromising code quality:

- **Project scaffolding**: initial Vite, TypeScript, Tailwind, and shadcn/ui setup, path aliases, and folder conventions.
- **UI generation**: building the dashboard components, the state layer, the mock service layer, and the interactive banking flows from written user stories and acceptance criteria.
- **Quality verification**: running type checks, lint, and production builds; validating the chart palette for color-vision-deficiency safety; and driving the app in a headless browser to confirm search, filtering, dialogs, and settlement behave as specified.
- **Git flow automation**: creating feature branches per issue, writing conventional commit messages, and opening pull requests into `dev` before promotion to `main`.

Every change was reviewed and directed by the developer. The AI handled the repetitive and boilerplate-heavy work, which freed time for architecture, UX decisions, and review, and helped keep the codebase consistent, typed, and modular.

---

## Trade-offs & Next Steps

### Scoped out for the MVP
This case study was delivered under a **24-hour time constraint**. To focus on demonstrating UI/UX and frontend architecture, the following were intentionally scoped out of this phase:

- **Backend integration**: there is no authentication and there are no real API endpoints. The app runs on **mock data**: a seeded, deterministic 120-day transaction history generated relative to the current date, served through the service layer with simulated latency.
- **Unit and integration testing**: no automated test suite (e.g. **Vitest** with React Testing Library) is included yet.

### Next steps
1. **Backend integration**: replace the mock services with a typed API client, add authentication (e.g. OAuth 2.0 / OIDC with secure session handling), and introduce a data-fetching layer such as TanStack Query for caching, retries, and optimistic updates.
2. **Testing**: add Vitest unit tests for `src/lib/finance.ts` and the reducer, component tests with React Testing Library, and end-to-end tests with Playwright for the critical banking flows.
3. **Routing**: add dedicated pages (full transaction history, account details, settings) with React Router.
4. **CI/CD**: a GitHub Actions pipeline for lint, type check, test, and build on every pull request.
5. **Performance**: code-split the chart and dialogs to reduce the initial bundle, and virtualize long transaction lists.
6. **Enhancements**: dark mode, internationalization and multi-currency support, and CSV/PDF statement export.

---

## How to Run Locally

### Prerequisites
- **Node.js** `20.19+` or `22.12+`
- **npm** (bundled with Node.js)

### Setup

```bash
# 1. Clone the repository
git clone https://github.com/LordRock02/post-oak-banking-frontend.git
cd post-oak-banking-frontend

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

Then open the URL printed in the terminal (by default **http://localhost:5173**).

### Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server with hot module replacement |
| `npm run build` | Type-check and build for production into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Lint the codebase with Oxlint |
