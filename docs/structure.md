# Project Structure

This repo is a roblox-ts app. TypeScript in `src/` compiles to `out/`, Rojo builds `out/` into `Orca.rbxm`, and the bundle scripts turn that model into `public/dev.lua` or release snapshots.

## Entry Points

- `src/main.client.tsx` starts Orca, creates the Rodux store, mounts the Roact app, and handles cleanup when Orca is re-executed.
- `src/App.tsx` lays out the top-level UI: dashboard, pages, navbar, clock, and hint area.
- `default.project.json` tells Rojo to build from `out/` and include rbxts dependencies from `include/node_modules`.

## Source Folders

- `src/components/`
  Reusable UI primitives. These should not know about a specific page.
  Examples: `Canvas`, `Card`, `BrightButton`, `BrightSlider`, `ActionButton`, `Glow`, `Fill`, `Border`.

- `src/features/`
  Actual UI screens and page sections. This is where most visible app work happens.
  `features/Pages/Home/Profile/Sliders.tsx` is a Home-page feature.
  `features/Pages/Apps/Players/Actions.tsx` is an Apps > Players feature.

- `src/jobs/`
  Runtime behavior behind UI controls. These files do Roblox-side work such as flight, noclip, ESP, teleport, spectate, and freecam.
  UI dispatches job state changes; jobs observe the store and perform effects.

- `src/store/`
  Rodux state, actions, reducers, and persisted settings.
  `actions/` describes state changes.
  `reducers/` applies state changes.
  `models/` defines state shapes.
  `persistent-state.ts` handles saved state.

- `src/hooks/`
  Shared Roact hooks. Page/state hooks live at the top level. Lower-level reusable hooks live in `hooks/common/`.

- `src/themes/`
  Theme definitions and theme types. UI components read colors/transparency from here through `useTheme`.

- `src/utils/`
  Small reusable helpers for numbers, bindings, colors, UDim2 values, timeouts, HTTP, and scripts.

- `src/context/`
  Roact context objects used across the UI, currently mostly scaling-related.

## How A Button Usually Works

1. A UI component renders a button in `src/features/...`.
2. The button dispatches an action from `src/store/actions/...`.
3. A reducer in `src/store/reducers/...` updates the Rodux state.
4. A job in `src/jobs/...` observes that state and performs the Roblox behavior.

For example:

- `features/Pages/Home/Profile/Actions.tsx` renders the noclip button.
- `components/ActionButton.tsx` dispatches `setJobActive("noclip", true)`.
- `store/reducers/jobs.reducer.ts` stores that active state.
- `jobs/character/noclip.client.ts` reacts to the state and applies noclip behavior.

## Naming Notes

The current repo uses the OrcaPlus naming:

- `features` means "app UI screens and page pieces."
- `components` means "reusable UI building blocks."
- `jobs` means "Roblox behavior/effects outside the UI."

The upstream `2.0.0` branch reorganizes more than this folder name, including the store and reusable component stack. For OrcaPlus, prefer small targeted changes unless we decide to do a full UI architecture migration.
