# Contributing to Rafeeq

Thank you for your interest in contributing to Rafeeq. This guide explains how to set up the project, make changes, and prepare a pull request.

## Getting Started

Rafeeq is a Vue 3 + Vite PWA. You will need [Bun](https://bun.sh/) installed.

```bash
bun install
bun run dev
```

The local development server runs at `http://localhost:5173`.

## Project Structure

- `src/app`: application setup, router, stores, and PWA configuration.
- `src/layout`: shared layout components.
- `src/shared`: utilities and components reused across features.
- `src/features/<feature>`: feature-specific views, components, composables, data, and helpers.
- `public`: static data, icons, images, and service-worker files.

Keep feature-specific logic inside its feature folder. Move code to `src/shared` only when it is genuinely reused.

## Development Workflow

Use these commands before submitting changes:

```bash
bun run lint
bun run format
bun run test:run
bun run build
```

For larger changes, run coverage as well:

```bash
bun run test:coverage
```

## Coding Style

- Use 2-space indentation, LF line endings, single quotes, no semicolons, trailing commas, and a 120-character print width.
- Prefer the `@/` alias for imports from `src`.
- Name Vue components in PascalCase, such as `PrayerTimes.vue`.
- Name composables with a `use` prefix, such as `useAudioPlayer.js`.
- Name test files as `*.spec.js` and place them beside the code they exercise.

## Testing

Tests use Vitest with `jsdom` and globals enabled. Add focused regression tests for bug fixes when the behavior can be isolated without a full browser.

## Pull Requests

Before opening a pull request:

- Keep the change focused and describe the intent clearly.
- Link related issues when applicable.
- Include screenshots or screen recordings for UI changes.
- Note any PWA, public asset, or configuration changes.
- Confirm which checks you ran, especially lint, format, tests, and build.

## Security

Do not commit secrets. Keep real values in local or deployment environment variables.
