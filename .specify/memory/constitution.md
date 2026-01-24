# Minesweeper Vibe - Project Constitution

## Project Overview

**Minesweeper Vibe** is a modern, accessible implementation of the classic Minesweeper game built with TypeScript and Vite.

## Core Principles

### 1. Simplicity First
- Minimal dependencies - use vanilla HTML, CSS, and TypeScript where possible
- No complex frameworks - Vite for bundling only
- Clean, readable code over clever solutions

### 2. Accessibility & Usability
- Support multiple themes (light, dark, high contrast, system)
- Adjustable cell sizes for different screen sizes and visual preferences
- Keyboard navigation support
- Clear visual feedback for all interactions

### 3. Code Quality Standards
- TypeScript strict mode enabled
- Comprehensive unit tests with Vitest (maintain >90% coverage for game logic)
- ESLint and Prettier for consistent formatting
- All features must include tests before merging

### 4. User Experience
- Fast, responsive UI with minimal animations
- Settings persist across sessions (localStorage)
- Mobile-friendly touch interactions
- Instant visual feedback on user actions

### 5. Development Workflow
- Feature branches with descriptive names (`feature/`, `fix/`, `chore/`)
- Pull requests for all changes
- Tests must pass before merging
- Clear commit messages following conventional commits

## Technical Stack

| Component | Technology |
|-----------|------------|
| Language | TypeScript |
| Bundler | Vite |
| Testing | Vitest |
| Styling | Vanilla CSS with CSS Variables |
| State | In-memory (no external state management) |

## File Structure

```
src/
├── game.ts        # Core game logic
├── game.test.ts   # Game logic tests
├── settings.ts    # Settings modal & preferences
├── settings.test.ts # Settings tests
├── animations.ts  # Animation utilities
├── style.css      # All styles
└── main.ts        # Entry point
```

## Non-Goals

- Server-side functionality
- User accounts or authentication
- Multiplayer features (for now)
- Complex animation libraries
- Heavy UI frameworks (React, Vue, etc.)

## Quality Gates

Before any feature is considered complete:
1. ✅ All existing tests pass
2. ✅ New functionality has test coverage
3. ✅ Build succeeds (`npm run build`)
4. ✅ No TypeScript errors
5. ✅ Manual testing in browser
