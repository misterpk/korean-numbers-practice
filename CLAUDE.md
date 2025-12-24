# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Korean Numbers Practice is a React-based educational web application for learning Korean number systems. Built with Vite for fast development and optimized production builds.

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
│   ├── main.jsx          # Entry point - renders App to DOM
│   ├── App.jsx           # Main component with quiz logic
│   └── index.css         # Global styles
├── index.html            # HTML template (Vite injects scripts)
├── vite.config.js        # Vite configuration
├── package.json          # Dependencies and scripts
└── CLAUDE.md            # This file
```

## Architecture

**Build System**: Vite
- Fast HMR (Hot Module Replacement) - see changes instantly
- ES modules-based development
- Optimized production builds with code splitting

**Component Structure**
- `src/App.jsx` - Single-component application containing:
  - Quiz logic and state management (React hooks)
  - Number conversion algorithms for both Korean number systems
  - Settings and user interactions
  - All UI rendering

**Number Systems**
- **Native Korean (0-99)**: Pre-defined array of Korean number words
- **Sino-Korean (0-9999)**: Algorithmic conversion using digit/unit mappings

**Core Logic**
- `convertToSinoKorean(num)` - Converts Arabic numerals to Sino-Korean
  - Uses `sinoKoreanDigits` and `sinoKoreanUnits` arrays
  - Handles special case for digit 1 with position units
- `generateQuestion()` - Random number generation within configured range
- `checkAnswer()` - Answer validation and scoring

**State Management**
All state managed via React useState hooks:
- Settings: `numberSystem`, `direction`, `minRange`, `maxRange`
- Quiz state: `currentNumber`, `userAnswer`, `feedback`, `score`, `hasAnswered`

## Development Workflow

1. **Start dev server**: `npm run dev`
2. **Edit code**: Make changes to `src/App.jsx` or `src/index.css`
3. **See changes instantly**: Browser updates automatically (no refresh needed!)
4. **Deploy**: `npm run deploy` when ready to publish

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

- `vite.config.js`: Sets `base: '/korean-numbers-practice/'` for GitHub Pages
- `package.json`: Contains deploy script that builds and publishes to gh-pages branch
- Vite automatically handles JSX transformation, no Babel config needed
