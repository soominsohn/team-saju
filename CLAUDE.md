# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Team Saju** is a Next.js web application that analyzes team compatibility using Korean traditional astrology (사주명리학 - Four Pillars of Destiny). The service calculates individual birth charts (사주팔자), element distributions (오행: 목·화·토·금·수), and team compatibility scores based on nourishing (상생) and conflicting (상극) relationships.

This is a **Phase 0 POC** implementation focused on core calculation engines, basic API endpoints, and data persistence with PostgreSQL via Prisma.

## Common Commands

### Development
```bash
npm run dev              # Start Next.js dev server (port 3000)
npm run build            # Build production bundle
npm start                # Start production server
```

### Database
```bash
npm run db:seed          # Seed database with sample data (uses tsx prisma/seed.ts)
docker compose up -d     # Start PostgreSQL container
npm run docker:down      # Stop and remove containers
```

### Testing
```bash
npm test                 # Run all Vitest tests
npm run test:watch       # Run tests in watch mode
```

### Linting
```bash
npm run lint             # Run Next.js ESLint
```

## High-Level Architecture

### Core Calculation Flow

1. **Birth Input → GanJi Chart** (`lib/elements.ts`):
   - `deriveGanJiFromBirth()` converts birthdate/time to 간지 (Heavenly Stems + Earthly Branches)
   - Produces 8-character chart: year/month/day/hour stems and branches
   - Uses simplified calendar calculation (BASE_DATE reference)

2. **GanJi Chart → Element Profile** (`lib/elements.ts`):
   - `calculateElementProfile()` maps stems/branches to five elements (木火土金水)
   - Applies weights: stems = 1.2, branches = 1.0 (or hidden stem weights from 지장간)
   - Returns normalized ElementProfile {wood, fire, earth, metal, water}

3. **Element Profile → Insights** (`lib/elements.ts`, `lib/team.ts`):
   - `profileInsights()`: identifies missing (<0.1) and skewed (>0.3) elements
   - `dominantElement()`: finds primary element for role mapping
   - `summarizeTenGods()`: calculates Ten Gods (십신) profile for personality insights

4. **Multi-Person Analysis**:
   - **Pair Compatibility** (`lib/compat.ts`): `computePairCompatibility()` uses bidirectional nourishing/control scores
   - **Team Scoring** (`lib/team.ts`): `scoreTeam()` computes balance (entropy), nourish flow, conflict penalty, role coverage
   - **Branch Relations** (`lib/relations.ts`): detects clash/harm/combine/punish between members' day branches

### Data Layer (Prisma + PostgreSQL)

**Schema Models** (`prisma/schema.prisma`):
- `Team`: name, purpose, shareToken, expiresAt
- `Member`: displayName, birthDate, birthTime (nullable), timezone
- `Chart`: 8-character stems/branches (hour can be null if birthTime unknown)
- `ElementProfile`: normalized wood/fire/earth/metal/water + dominant
- `PairScore`: compatibility between two members
- `TeamScore`: balanceIdx, nourishIdx, conflictIdx, roleCoverage, finalScore
- `AuditLog`: audit trail for team actions

**Service Layer** (`lib/services/reportService.ts`):
- `createTeamWithReport()`: transaction that creates team, members, charts, profiles, pair scores, team score
- `getTeamReport()`: retrieves existing team analysis, validates shareToken

### API Routes

- `POST /api/reports/team`: Create new team with members and generate full report
  - Input: `{teamName, purpose?, members: [{displayName, birthDate, birthTime?}]}`
  - Returns: teamId, shareToken, teamScore, member summaries, pair scores, dynamics

- `GET /api/teams/[teamId]`: Fetch existing team report (with shareToken validation)

### Frontend Structure

- **App Router** (`app/`): Next.js 14 App Router with server components
- **Components** (`components/`):
  - `charts/`: Recharts-based visualizations (TeamElementPie, MemberRadar, CompatibilityGraph with d3-force)
  - `report/`: ResultPanel for displaying analysis results
- **Types** (`types/report.ts`): Shared TypeScript types

### Path Aliases

TypeScript path mappings (tsconfig.json):
- `@/lib/*` → `lib/*`
- `@/components/*` → `components/*`
- `@/types/*` → `types/*`

## Key Design Principles

### Element Calculation Rules

**Nourishing Cycle (상생)**:
- Wood → Fire → Earth → Metal → Water → Wood

**Controlling Cycle (상극)**:
- Wood controls Earth, Fire controls Metal, Earth controls Water, Metal controls Wood, Water controls Fire

**Weights**:
- Heavenly Stems (천간): 1.2
- Earthly Branches (지지): 1.0 (or hidden stems with fractional weights)

**Normalization**: All element profiles sum to 1.0 for consistent comparison

### Team Scoring Formula

```typescript
finalScore = 0.25 * balanceIdx + 0.35 * nourishIdx + 0.25 * conflictIdx + 0.15 * roleCoverage
```

- **balanceIdx**: Entropy-based measure (higher = more balanced distribution)
- **nourishIdx**: Flow strength along nourishing cycle
- **conflictIdx**: Inverse of control relationship tension
- **roleCoverage**: Diversity of dominant elements (max 5)

### Branch Relations (형충파해)

Four special relationships between earthly branches:
- **Clash (충)**: Direct opposition (e.g., 子-午, 丑-未)
- **Harm (해)**: Depletion/weakening
- **Combine (합)**: Harmonious merger
- **Punish (형)**: Punishment/restriction

These are analyzed via `analyzeBranchRelations()` to provide team dynamics insights.

## Testing Strategy

Tests use **Vitest** with node environment:
- `tests/elements.test.ts`: Validates stem/branch mapping, element calculation
- `tests/compat.test.ts`: Verifies pair compatibility scoring logic

Run individual test files:
```bash
npx vitest tests/elements.test.ts
```

## Database Development

**Local Setup**:
1. Ensure `.env` contains `DATABASE_URL=postgresql://...`
2. Start PostgreSQL: `docker compose up -d`
3. Apply schema: `npx prisma db push` (for dev) or `npx prisma migrate dev` (with migrations)
4. Seed data: `npm run db:seed`

**Prisma Client**:
- Singleton instance exported from `lib/prisma.ts`
- Use `prisma.$transaction()` for multi-step operations (see `createTeamWithReport()`)

## Important Files

- **spec.md**: Full Korean specification with scoring formulas, UX flows, and roadmap
- **DEV_PLAN.md**: Phase 0 implementation priorities and component breakdown
- **lib/elements.ts**: Core calculation engine (400+ lines, includes Ten Gods logic)
- **lib/services/reportService.ts**: Business logic for team creation and retrieval

## Known Limitations (POC Phase)

- GanJi calculation is simplified (not true lunar calendar conversion)
- Birth time is optional; hour stem/branch omitted if unknown
- No authentication/authorization yet (shareToken validation only)
- No PDF export functionality (planned for Phase 1)
- Frontend is basic placeholder (full UI in progress)
- Hidden stems (지장간) are implemented but can be toggled off

## Future Phases

See **spec.md** section 11 for full roadmap:
- **Phase 1**: Magic link auth, PDF reports, advanced visualizations
- **Phase 2**: True lunar calendar, 형충파해 (clashes/harms), 대운/세운 (luck cycles), ML-based text generation
