# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Korean Numbers Practice is a React-based educational web application for learning Korean number systems. The entire application is contained in a single JSX file (`korean-numbers-practice.jsx`).

## Architecture

**Single-Component Architecture**
- `korean-numbers-practice.jsx` - Self-contained React component that handles:
  - UI rendering and styling (inline styles)
  - Quiz logic and state management (React hooks)
  - Number conversion algorithms for both Korean number systems
  - Settings and user interactions

**Number Systems**
- **Native Korean (0-99)**: Pre-defined array of Korean number words
- **Sino-Korean (0-9999)**: Algorithmic conversion using digit/unit mappings

**Core Logic**
- `convertToSinoKorean(num)` (line 22-43): Converts Arabic numerals to Sino-Korean
  - Uses `sinoKoreanDigits` and `sinoKoreanUnits` arrays
  - Handles special case for digit 1 with position units
- `generateQuestion()` (line 59-67): Random number generation within configured range
- `checkAnswer()` (line 82-98): Answer validation and scoring

**State Management**
All state is managed via React useState hooks:
- Settings: `numberSystem`, `direction`, `minRange`, `maxRange`
- Quiz state: `currentNumber`, `userAnswer`, `feedback`, `score`, `hasAnswered`

## Development Context

This is a standalone React component file without a build system, package.json, or test infrastructure. To use or develop this component:

1. Import into an existing React application
2. Or embed in an HTML file with React/ReactDOM CDN scripts
3. Component exports as default: `export default KoreanNumbersPractice`

## Key Implementation Details

- Native Korean numbers limited to 0-99 (array length constraint at line 76)
- Sino-Korean supports 0-9999 (range enforced at line 61)
- Direction modes: Korean→English (numeric answer) or English→Korean (text answer)
- Inline styles used throughout (no CSS files)
- Answer comparison is case-sensitive and whitespace-trimmed
