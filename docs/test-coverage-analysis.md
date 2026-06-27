# Test Coverage Analysis

_Generated 2026-06-27 — baseline for prioritising test work._

## Summary

The suite is healthy where it exists (12 spec files, 56 tests, all green) and
the existing tests model good patterns: pure-logic unit tests (`zakat`, `qibla`,
`arabic`), dependency injection for browser APIs (`useGeolocation`), and focused
composable tests (`useAudioPlayer`, `useQuranBookmark`). The problem is **breadth**:
testing is concentrated in a handful of helpers while the bulk of the app — every
Pinia store, most shared utilities, most composables, and nearly all components —
has no tests at all.

### Real vs. reported coverage

`bun run test:coverage` currently reports **~78% statements**, but that number is
misleading. `vitest.config.js` has no `coverage` block, so V8 only measures files
that a test happens to import. Files that no test touches are invisible.

Measuring **all** source files tells the real story:

| Metric      | Reported (imported files only) | Actual (all `src`) |
| ----------- | ------------------------------ | ------------------ |
| Statements  | 77.7%                          | **10.5%** (202/1919) |
| Branches    | 72.3%                          | **7.8%** (99/1262)   |
| Functions   | 67.2%                          | **7.4%** (43/583)    |
| Lines       | 78.4%                          | **10.8%** (181/1680) |

Only **2 of ~60 Vue components** and a minority of the JS modules are exercised.

## Recommendations

### 0. Fix coverage measurement (do this first)

Make coverage reflect the whole codebase so the metric is honest and regressions
are visible. In `vitest.config.js`:

```js
test: {
  // ...
  coverage: {
    all: true,
    include: ['src/**/*.{js,vue}'],
    exclude: ['src/**/*.spec.js', 'src/**/data/**', 'src/app/main.js'],
  },
}
```

CI (`.github/workflows/test.yml`) runs `bun run test:run`, which never produces a
coverage report. Consider running `test:coverage` in CI and (optionally) adding a
modest `thresholds` floor so coverage can ratchet up over time without backsliding.

### Priority 1 — Pure logic, high value, low effort

These are deterministic functions with clear inputs/outputs and real correctness
or data-loss risk. They should be tested first.

- **`src/features/settings/lib/backup.js`** — _highest priority._ Export/import of
  the user's entire settings + azkar progress, with validation and a destructive
  restore (it clears managed keys before writing). A bug here loses user data
  silently. Every function takes an injectable `storage`, so it's trivial to test
  with a fake. Cover: round-trip serialize→restore; rejection of `INVALID_JSON`,
  wrong `app`/`version`, non-string values, unmanaged keys; dynamic
  `azkarProgress:*` key matching; that restore wipes stale keys first.
- **`src/features/quran/store.js`** — surah URL zero-padding (`getSurahAudioUrl`),
  `updateCurrentAyahFromTime` boundary scan, `getAyahStartTime` ms→s conversion,
  reciter fallback to default on invalid id, and that `changeReciter` defers audio
  reload. Mostly pure; needs only `setActivePinia` + a `fetch` mock.
- **`src/shared/utils/css.js`** — `clampFontScale` (bounds, rounding, non-finite →
  default) is pure and trivial; `applyMode` / `applyFontScale` are one-line DOM
  writes verifiable in jsdom.
- **`src/shared/utils/head.js`** — `useMeta` title merge (`" - رفيق"` suffix logic),
  keyword joining, and create-vs-update of `<meta>` tags. Pure jsdom.
- **`src/shared/utils/format.js`** — trivial `Intl` wrappers; lock the locale/format
  contract so refactors don't silently change displayed numbers.

### Priority 2 — Stores & composables (reactive logic)

State management is the app's core and is **0% covered**. Each is testable with
`setActivePinia(createPinia())` and mocked dependencies.

- **`src/features/downloads/store.js`** — the most logic-dense store: queue dedup
  (`isInQueue`), `processQueue` retry-on-failure (re-queues to the back),
  offline-pause loop, `progressPercentage`/`isCompleted`, pause/resume/cancel.
  Mock `useOfflineData` and the `fetchSurah`/`fetchCategory` APIs.
- **`src/app/stores/theme.js`** — `setMode` rejects invalid values, font-scale
  clamping wiring, `resolvedMode` system→light/dark, `applyQueryOverrides`.
- **`src/app/stores/app.js`** — sanitisation of non-finite `zekrVibrationIntensity`.
- **`src/features/prayers/store.js`** — `detect()` success/failure paths (mock
  `getCurrentPosition`), `clear()` on error, `vertical` computed across
  layout × viewport.
- **`src/shared/composables/useFavorites.js`** — toggle add/remove, `isFavorite`,
  `filterFavorites` reactivity.
- **`src/shared/composables/useSearch.js`** — Arabic-normalised filtering across
  keys, empty-search passthrough.
- **`src/features/azkar/composables/useAzkarProgress.js`** — day-boundary reset
  (stub the date), persist vs. in-memory modes, `reset()`.
- **`src/shared/composables/useReconnectExecute.js`** — fires `execute` only on a
  genuine offline→online transition, not on first run or no-op changes.

### Priority 3 — Components & integration

Only `ZekrCard` and `PrayerIcon` have component tests. Prioritise components with
real behaviour over presentational ones, using `@vue/test-utils` (already a dep):

- **`Sebha.vue`** — counter increment/reset, the core of the tasbeeh feature.
- **`ZakatCalculatorCard.vue`** — wires the well-tested `zakat` lib to inputs;
  verify the integration and formatting.
- **`SettingsImportExport.vue`** — UI around the data-critical `backup.js`.
- **Audio/player components** (`QuranPlayer.vue`, `RadioPlayer.vue`) — stateful and
  bug-prone; at least smoke-test play/stop/error states.

### Lower priority / explicit non-goals

- `src/**/data/*.js` (static surah/reciter/category tables) — exclude from coverage
  rather than test.
- Thin DOM/browser-API wrappers (`useVibration`, `useIsMobile`, `analytics.js`,
  `export.js` html2canvas flow) — low ROI under jsdom; cover only the pure branches
  (e.g. the mime/format mapping in `export.js`) if at all.

## Suggested sequencing

1. Fix the coverage config so the metric is real (Priority 0).
2. Land Priority 1 — biggest correctness/data-loss wins for the least effort.
3. Work through Priority 2 stores/composables.
4. Add Priority 3 component tests as those features change.
5. Once a credible baseline exists, add a coverage threshold in CI to prevent
   regressions.
