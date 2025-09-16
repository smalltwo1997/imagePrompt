# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Saasfly is a Next.js SaaS boilerplate built with Turborepo monorepo architecture. It provides authentication, billing, internationalization, and a complete foundation for building SaaS applications.

## Development Commands

**Prerequisites:** Bun package manager is required (`bun@v1.1.10` specified in package.json)

### Primary Development
- `bun run dev` - Start all services in development mode (parallel execution)
- `bun run dev:web` - Start development excluding Stripe services
- `bun db:push` - Push database schema changes (run from packages/db/)

### Build & Deployment
- `bun run build` - Build all packages and apps using Turbo
- `bun run typecheck` - Run TypeScript checks across all packages
- `bun run lint` - Run ESLint checks across all packages
- `bun run lint:fix` - Auto-fix ESLint issues

### Code Quality
- `bun run format` - Check code formatting with Prettier
- `bun run format:fix` - Auto-fix formatting issues

### Utilities
- `bun run clean` - Clean node_modules
- `bun run clean:workspaces` - Clean all workspace node_modules
- `bun run gen` - Run Turbo generators for scaffolding

## Architecture Overview

### Monorepo Structure
- **apps/nextjs** - Main Next.js application with App Router
- **apps/auth-proxy** - Authentication proxy service
- **packages/api** - tRPC API layer with end-to-end type safety
- **packages/db** - Database layer using Kysely with Prisma for schema management
- **packages/auth** - Authentication utilities (NextAuth.js + Clerk support)
- **packages/stripe** - Stripe integration for payments
- **packages/ui** - Shared UI components built with Shadcn/ui
- **packages/common** - Shared utilities and types
- **tooling/** - Shared ESLint, Prettier, TypeScript, and Tailwind configurations

### Key Technologies
- **Framework:** Next.js 14 with App Router
- **Database:** PostgreSQL with Kysely (type-safe SQL) and Prisma (schema management)
- **Authentication:** Dual support for NextAuth.js and Clerk
- **API Layer:** tRPC for end-to-end type safety
- **UI:** Tailwind CSS + Shadcn/ui components + Framer Motion
- **State:** Zustand for global state management
- **Data Fetching:** TanStack React Query
- **Payments:** Stripe integration
- **Email:** Resend with React Email templates
- **i18n:** Next.js internationalization with locale-based routing

### Environment Setup
1. Copy `.env.example` to `.env.local`
2. Configure required environment variables:
   - Database: `POSTGRES_URL`
   - Authentication: `NEXTAUTH_SECRET`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`
   - Stripe: `STRIPE_API_KEY`, `STRIPE_WEBHOOK_SECRET`
   - App URL: `NEXT_PUBLIC_APP_URL`
   - Admin access: `ADMIN_EMAIL` (comma-separated emails for admin dashboard)

### App Router Structure
- **[lang]** - Internationalized routes with language segments
  - **(auth)** - Authentication pages (login, register)
  - **(dashboard)** - Protected user dashboard with billing/settings
  - **(marketing)** - Public marketing pages and blog
  - **(docs)** - Documentation pages with MDX content
  - **(editor)** - Editor interface (cluster-based)
- **admin** - Admin dashboard (requires ADMIN_EMAIL configuration)
- **api** - API routes including tRPC endpoints and webhooks

### Database Management
- Schema defined in packages/db with Prisma
- Type-safe queries using Kysely
- Run `bun db:push` from packages/db/ directory to apply schema changes
- Database migrations managed through Prisma

### Authentication Patterns
- Dual authentication system supporting both NextAuth.js and Clerk
- Clerk is the default after June 1st, 2025
- NextAuth.js implementation available in feature-nextauth branch
- Protected routes use middleware for authentication checks

### Content Management
- Blog posts and documentation use Contentlayer2 for MDX processing
- Content builds are integrated into the Next.js build process
- Supports syntax highlighting, table of contents, and autolink headings

### Styling Conventions
- Tailwind CSS utility classes
- Shadcn/ui component library for consistent design system
- Framer Motion for animations
- Theme support with next-themes
- Responsive design patterns throughout

### Deployment Notes
- Optimized for Vercel deployment
- Includes Vercel Analytics and Speed Insights
- PostHog analytics integration available
- Environment variables must be configured in deployment platform