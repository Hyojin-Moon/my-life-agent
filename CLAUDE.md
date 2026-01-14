# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

개인 맞춤형 AI 추천 에이전트 - 여행지, 운동코스, 식사 메뉴를 사용자 프로필과 기록을 기반으로 추천하는 서비스.

## Commands

```bash
# Install dependencies
pnpm install

# Development (runs all apps concurrently)
pnpm dev

# Build all packages
pnpm build

# Type checking
pnpm lint

# Database
pnpm db:generate          # Generate Prisma client
pnpm db:push              # Push schema to database
cd packages/database && pnpm db:studio   # Open Prisma Studio
cd packages/database && pnpm db:seed     # Seed database

# Run individual apps
cd apps/api && pnpm dev   # API server on port 8080
cd apps/web && pnpm dev   # Web app on port 3000
```

## Architecture

**Monorepo Structure** (pnpm workspaces + Turborepo)

```
apps/
  api/          # Hono + Bun API server
  web/          # Next.js 15 + React 19 frontend (Tailwind CSS)

packages/
  shared/       # Shared types, Zod schemas, utilities
  ai-agent/     # Gemini AI integration (LifeAgent class)
  database/     # Prisma + SQLite
```

**Data Flow**: Web → API → AI Agent → Gemini API → Response

**Key Components**:
- `LifeAgent` (packages/ai-agent/src/agent.ts): Core AI agent that generates recommendations based on user profile and records
- `GeminiClient` (packages/ai-agent/src/gemini.ts): Wrapper for Google Generative AI SDK with JSON response parsing
- API routes use Hono with zod-validator for request validation
- Database repositories in `packages/database/src/repositories/` handle all Prisma operations

**API Endpoints**:
- `/api/profile` - User profile CRUD
- `/api/recommendations` - AI-powered recommendations (food, travel, exercise)
- `/api/records` - Life records CRUD with stats

## Environment Variables

- `DATABASE_URL`: SQLite database path (packages/database)
- `GEMINI_API_KEY`: Google AI API key (packages/ai-agent)
- `NEXT_PUBLIC_API_URL`: API base URL for web client (default: http://localhost:8080)
