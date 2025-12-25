# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Korean Numbers Practice is a React + TypeScript educational web application for learning Korean number systems. Built with Vite for fast development and optimized production builds.

## Development Setup

### Prerequisites
- Node.js (v18 or higher)
- npm (comes with Node.js)

### Initial Setup
```bash
# Install dependencies (first time only)
npm install
```

## Common Development Commands

### Local Development
```bash
# Start development server with hot module replacement (HMR)
npm run dev

# Server starts at http://localhost:5173
# Changes to code auto-refresh the browser instantly
```

### Testing
```bash
# Run all tests once
npm test

# Run tests in watch mode (auto-reruns on file changes)
npm test:watch

# Run tests with coverage report
npm test:coverage
```

### Building for Production
```bash
# Create optimized production build in dist/
npm run build

# Preview production build locally
npm run preview
```

### Deployment
```bash
# Deploy to GitHub Pages
npm run deploy

# This runs:
# 1. npm run build (creates optimized dist/)
# 2. gh-pages -d dist (publishes to GitHub Pages)
```

## Project Structure

```
korean-numbers-practice/
├── src/
│   ├── main.tsx                      # Entry point - renders App to DOM
│   ├── App.tsx                       # Main component with quiz logic (TypeScript)
│   ├── App.test.tsx                  # Integration tests for App component
│   ├── setupTests.ts                 # Jest test environment setup
│   ├── index.css                     # Global styles
│   └── utils/
│       ├── koreanNumbers.ts          # Korean number conversion utilities
│       └── koreanNumbers.test.ts     # Unit tests for utilities
├── index.html                        # HTML template (Vite injects scripts)
├── jest.config.js                    # Jest testing configuration
├── tsconfig.json                     # TypeScript configuration
├── vite.config.js                    # Vite configuration
├── package.json                      # Dependencies and scripts
└── CLAUDE.md                         # This file
```

## Architecture

**Build System**: Vite + TypeScript
- Fast HMR (Hot Module Replacement) - see changes instantly
- TypeScript for type safety and better developer experience
- ES modules-based development
- Optimized production builds with code splitting

**Testing**: Jest + React Testing Library
- 75 comprehensive tests covering utilities and UI interactions
- Unit tests for Korean number conversion logic
- Integration tests for React component behavior
- Configured with ts-jest for TypeScript support
- Test utilities extracted to separate modules for better testability

**Component Structure**
- `src/App.tsx` - Main React component (TypeScript) containing:
  - Quiz logic and state management (React hooks)
  - Settings and user interactions
  - All UI rendering
  - Uses utility functions from `src/utils/koreanNumbers.ts`

**Utility Modules**
- `src/utils/koreanNumbers.ts` - Korean number conversion utilities:
  - `convertToSinoKorean(num)` - Converts Arabic numerals to Sino-Korean
  - `getKoreanText(num, system)` - Get Korean text for any number system
  - `getMaxNumber(system)` - Get max number for each system
  - `nativeKorean` - Array of native Korean numbers (0-99)

**Number Systems**
- **Native Korean (0-99)**: Pre-defined array of Korean number words
- **Sino-Korean (0-9999)**: Algorithmic conversion using digit/unit mappings
  - Uses `sinoKoreanDigits` and `sinoKoreanUnits` arrays
  - Handles special case for digit 1 with position units (10=십, not 일십)

**Core Logic**
- `generateQuestion()` - Random number generation with duplicate avoidance
- `checkAnswer()` - Answer validation and scoring with functional state updates

**State Management**
All state managed via React useState hooks with TypeScript types:
- Settings: `numberSystem: NumberSystem`, `direction: Direction`, `minRange: number`, `maxRange: number`
- Quiz state: `currentNumber: number | null`, `userAnswer: string`, `feedback: Feedback | null`, `score: Score`, `hasAnswered: boolean`

**TypeScript Types**
- `NumberSystem`: 'native' | 'sino' - Type for number system selection
- `Direction`: 'koreanToEnglish' | 'englishToKorean' - Type for quiz direction
- `Feedback`: { isCorrect: boolean, correctAnswer: string } - Feedback state interface
- `Score`: { correct: number, total: number } - Score tracking interface

## Testing Strategy

**Test Organization**
- **Unit Tests**: `src/utils/koreanNumbers.test.ts` (69 tests)
  - Tests for `convertToSinoKorean()` covering edge cases, single digits, tens, hundreds, thousands
  - Tests for numbers with zeros (101, 1001, etc.)
  - Validation of `nativeKorean` array
  - Tests for `getKoreanText()` with both number systems
  - Tests for `getMaxNumber()` helper

- **Integration Tests**: `src/App.test.tsx` (6 tests)
  - Initial render and UI state
  - Settings panel interactions
  - Quiz flow: submitting answers, scoring, feedback
  - Auto-advance and manual advance behavior
  - Input attributes for mobile keyboards
  - Number system and direction switching

**Test Best Practices**
- Utilities are extracted to separate modules for easier testing
- Use `fireEvent` for simple interactions, `waitFor` for async assertions
- Mock `Math.random()` to control question generation in tests
- Use fake timers for testing auto-advance behavior
- All tests use TypeScript for type safety

**Running Tests**
```bash
# Run all tests (recommended before committing)
npm test

# Develop with tests (auto-rerun on changes)
npm test:watch

# Check test coverage
npm test:coverage
```

## Development Workflow

1. **Start dev server**: `npm run dev`
2. **Edit code**: Make changes to `src/App.tsx`, utilities, or styles
3. **Run tests**: `npm test:watch` in another terminal for continuous testing
4. **See changes instantly**: Browser updates automatically (no refresh needed!)
5. **Verify tests pass**: All tests should pass before deploying
6. **Deploy**: `npm run deploy` when ready to publish

## Key Features

- Responsive design optimized for mobile devices
- Touch-friendly UI with 44px minimum touch targets
- Instant feedback on answers
- Score tracking
- Configurable number ranges
- Two-way practice (Korean→English or English→Korean)

## Deployment

The app is deployed to GitHub Pages at:
https://misterpk.github.io/korean-numbers-practice/

Deployment is automated via `npm run deploy` which uses gh-pages package.

## Configuration Notes

- `tsconfig.json`: TypeScript configuration with strict mode enabled
- `vite.config.js`: Sets `base: '/korean-numbers-practice/'` for GitHub Pages
- `package.json`: Contains deploy script that builds and publishes to gh-pages branch
- Vite automatically handles TypeScript and JSX transformation, no additional config needed
