<!--
===================================================================================
SYNC IMPACT REPORT - Constitution Update
===================================================================================
Version: 0.0.0 → 1.0.0
Change Type: MAJOR (Initial constitution establishment)
Date: 2026-02-12

Modified Principles:
- NEW: I. MVP-First (Radical Scope Control)
- NEW: II. Architectural Simplicity
- NEW: III. No Scope Expansion (NON-NEGOTIABLE)

Added Sections:
- Core Principles (3 principles)
- Technology Stack
- Development Constraints
- Governance

Removed Sections:
- None (initial version)

Templates Requiring Updates:
✅ plan-template.md - Constitution Check section validated
✅ spec-template.md - Requirements alignment validated
✅ tasks-template.md - Task categorization validated
- No command files present in .specify/templates/commands/

Follow-up TODOs:
- None - all placeholders filled

Rationale for MAJOR version (1.0.0):
This is the initial ratification of the project constitution, establishing
foundational principles for MVP-first development with strict scope control.
===================================================================================
-->

# Game Project Constitution

## Core Principles

### I. MVP-First (Radical Scope Control)

This project MUST operate under extreme MVP constraints to ensure rapid delivery and prevent over-engineering:

- **No Backend**: All functionality MUST run client-side only
- **No Authentication**: No user accounts, login systems, or identity management
- **No Persistence**: State exists only in-memory during runtime; no databases, localStorage, or external storage
- **No Testing Infrastructure**: No unit tests, integration tests, or testing frameworks required
- **No Premature Optimization**: Performance optimizations are forbidden until proven necessary by user feedback
- **No Overengineering**: Every line of code MUST serve an immediate, demonstrable user need

**Rationale**: Complexity is the enemy of shipping. By eliminating backend, persistence, and auth layers, we reduce the codebase to its essential game logic and UI, enabling rapid iteration and deployment.

### II. Architectural Simplicity

The technical stack MUST remain minimal and leverage proven, simple patterns:

- **React + Vite**: JavaScript only (TypeScript is prohibited to avoid compilation complexity)
- **Zustand for State**: Global state management MUST use Zustand—lightweight, minimal boilerplate
- **Separation of Concerns**: Pure game logic MUST be separated from UI components; game rules live in plain JavaScript modules, UI components consume and render that logic
- **No Framework Sprawl**: No additional UI frameworks, component libraries, or styling systems are required (vanilla CSS is sufficient)

**Rationale**: JavaScript-only React with Vite provides instant feedback loops. Zustand eliminates Redux boilerplate. Separating game logic from UI ensures testability (if ever needed) and reusability without architectural overhead.

### III. No Scope Expansion (NON-NEGOTIABLE)

The following features are **permanently forbidden** unless this constitution is formally amended:

- **No AI Players**: No bot opponents, computer players, or algorithmic decision-making
- **No Networking**: No multiplayer, WebSockets, server communication, or real-time sync
- **No User Accounts**: No registration, profiles, or identity persistence
- **No Persistent Storage**: No saving game state across sessions (in-memory state only)
- **No Styling Framework Requirement**: No Tailwind, Bootstrap, Material-UI, or other CSS frameworks mandated

**Rationale**: Scope creep kills MVPs. These features represent exponential complexity increases (networking = 10x, AI = 5x, persistence = 3x). By explicitly forbidding them, we protect the project from well-intentioned but fatal expansions.

## Technology Stack

**Required**:
- React 19+ (JavaScript, no TypeScript)
- Vite 7+ (build tool)
- Zustand (state management)
- ESLint (code quality)

**Prohibited**:
- TypeScript (adds compilation step)
- Backend frameworks (Node.js servers, Express, etc.)
- Databases (PostgreSQL, MongoDB, SQLite, etc.)
- Authentication libraries (Auth0, Firebase Auth, etc.)
- Testing frameworks (Jest, Vitest, Testing Library, etc.)
- CSS frameworks (Tailwind, Bootstrap, etc.) as mandatory dependencies

## Development Constraints

1. **Maintainability**: Code MUST be readable by junior developers; no clever tricks, no deep abstractions
2. **Modularity**: Game logic MUST be separable from UI; a component should not contain game rules
3. **Determinism**: Game state transitions MUST be predictable and debuggable
4. **In-Memory Only**: All state lives in Zustand stores; no side effects to external storage

## Governance

This constitution supersedes all other development practices and preferences.

**Amendment Process**:
1. Proposed changes MUST be documented with justification
2. Version number MUST be updated per semantic versioning:
   - **MAJOR**: Removing or redefining core principles (e.g., allowing backend)
   - **MINOR**: Adding new principles or constraints
   - **PATCH**: Clarifications, wording improvements, typo fixes
3. All template files in `.specify/templates/` MUST be reviewed for consistency

**Compliance**:
- All feature specifications MUST verify alignment with these principles
- Implementation plans MUST include a "Constitution Check" section
- Violations MUST be explicitly justified and documented

**Version**: 1.0.0 | **Ratified**: 2026-02-12 | **Last Amended**: 2026-02-12
