# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the app

There is no build step, package.json, linter, or test suite. The app is plain static files transpiled in the browser by Babel standalone.

- Serve the project root over HTTP (e.g. VS Code Live Server, or `npx http-server .`) and open `index.html`. Opening the file via `file://` will not work: `lib/loadBabelModules.js` fetches module sources with synchronous XHR.
- Routing uses `HashRouter`, so URLs look like `/#/todo`, `/#/todo/edit/:id`, `/#/dashboard`.
- All data lives in the browser (`localStorage` / `sessionStorage`). To reset seed data, clear `localStorage` (`todoDB`, `userDB`). `window.cs` exposes `todoService` in the console for debugging.

## In-browser module system (important constraints)

- React, ReactDOM, ReactRouter, ReactRouterDOM, PropTypes are loaded as **globals** from `lib/` via `<script>` tags — they are never imported. Access them by destructuring, e.g. `const { useState, useEffect } = React`, `const { Link, useParams } = ReactRouterDOM`.
- `app.js` is loaded as `type="module/babel"`. `lib/loadBabelModules.js` walks `import ... from '...'` statements with a regex, then appends each file as a `text/babel` script using the custom `ca-preset` (defined in `lib/babel-preset.js`, transforms ES modules to UMD).
  - Every import must be a single line starting at column 0: `import { X } from './path.js'`. Multi-line imports, `import './file'` without `from`, and dynamic `import()` will not be discovered.
  - Always include the file extension (`.jsx` / `.js`) and use relative paths.
  - Named exports are the convention (`export function TodoIndex()`).
- New CSS files must be added as an `@import` in `assets/style/main.css`; there is no CSS bundling.

## Architecture

- `RootCmp.jsx` — router and route table; `AppHeader` (with login/signup and `UserMsg`) wraps all pages.
- `pages/` — routed screens; `cmps/` — reusable components. Pages own state and call services; components get data and callbacks via props.
- `services/` — the data layer, all promise-based to mimic a backend:
  - `async-storage.service.js` — generic CRUD (`query/get/post/put/remove`) over a `localStorage` key, with an artificial 500ms delay. Entities use `_id`.
  - `todo.service.js` — todo domain logic on top of storage: filtering (`txt` regex, minimum `importance`), seeding demo todos on first load, next/prev ids in `get()`, importance stats for the dashboard. Todo model: `{ _id, txt, importance, isDone, createdAt, updatedAt }`.
  - `user.service.js` — fake auth: users in `localStorage` (`userDB`), logged-in user in `sessionStorage` (`user`). Passwords are not checked.
  - `event-bus.service.js` — pub/sub; `showSuccessMsg` / `showErrorMsg` emit `show-user-msg`, rendered by `cmps/UserMsg.jsx`. Use these for user feedback after service calls.
- Filter state in `TodoIndex` is synced to URL search params via `useSearchParams` and `todoService.getFilterFromSearchParams`; new filter fields must be added to `getDefaultFilter()` to round-trip through the URL.
