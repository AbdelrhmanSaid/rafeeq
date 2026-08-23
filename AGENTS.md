# Repository Guidelines

## Project Structure & Module Organization
Rafeeq is a React 19 + Vite PWA. Application setup lives in `src/app` (`main.jsx`, `App.jsx`, router, Zustand stores, PWA config), shared layout components live in `src/layout`, and cross-feature code lives in `src/shared` (`hooks`, `lib`, `ui`, `utils`, `offline`, `constants`, `styles`). Feature code is grouped under `src/features/<feature>` with common subfolders such as `views`, `components`, `hooks`, `data`, and `lib`; follow that pattern for new features. Static data, icons, images, and service-worker files live in `public`. Build output in `dist` and dependencies in `node_modules` are generated and should not be edited manually.

## Build, Test, and Development Commands

- `bun install`: install dependencies.
- `bun run dev`: start the Vite dev server at `http://localhost:5173`.
- `bun run build`: create the production build in `dist`.
- `bun run preview`: serve the built app locally.
- `bun run lint`: run ESLint with automatic fixes.
- `bun run format`: format `src/` and `public/` with Prettier.
- `bun run test:run`: run the Vitest suite once.
- `bun run test:coverage`: run tests with V8 coverage.

## Coding Style & Naming Conventions
Use 2-space indentation, LF line endings, single quotes, no semicolons, trailing commas, and a 120-character Prettier print width. Prefer the `@/` alias for imports from `src`. Name components in PascalCase (`PrayerTimes.jsx`), hooks with `use*` (`useAudioPlayer.js`), and specs as `*.spec.js` / `*.spec.jsx`. Component-scoped styles live in a co-located `*.module.scss` (CSS Modules); global classes, Bootstrap overrides, and shared utilities belong in `src/shared/styles`. Keep feature-specific logic inside its feature folder; move only genuinely reused code to `src/shared`.

## State & Data Conventions
Shared state lives in Zustand stores (`src/app/stores`, `src/features/*/store.js`); read from them with selectors rather than whole-store subscriptions. Persisted settings go through the `persistFields` middleware, which mirrors each field into its own `localStorage` key from `src/shared/constants/storageKeys.js` — those key strings must stay stable, since changing one discards that setting for existing users. Remote data is fetched through `useAsyncData` / `useJsonFetch`, and offline copies through `src/shared/offline`.

## Testing Guidelines
Tests use Vitest with `jsdom`, globals enabled, React Testing Library, and files matching `src/**/*.spec.{js,jsx}`. Place tests beside the code they exercise, especially for hooks, `lib` helpers, and shared UI behavior. Add regression tests for bug fixes when the behavior can be isolated without a full browser. Run `bun run test:run` before opening a PR; use `bun run test:coverage` for larger changes.

## Commit & Pull Request Guidelines
Recent commits use short, imperative summaries such as `Add CI workflow to run the test suite and build` and `Fix prayer-icon regression + address review feedback`. Keep commits focused and descriptive. PRs should include a clear summary, linked issue when applicable, screenshots or screen recordings for UI changes, and notes for PWA, public asset, or configuration changes. Confirm relevant checks: lint, format, tests, and build.

## Security & Configuration Tips
Do not commit secrets. keep real values in local or deployment environment variables.
