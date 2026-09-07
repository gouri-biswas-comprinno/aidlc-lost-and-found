# Construction Unit 2: React.js Application and Report List

## Unit 2 Goal

Build the React.js frontend for viewing reports from the existing Express API. This unit is read-only: it does not create, edit, open details, resolve, delete, or authenticate users.

## Technology

- React.js with JavaScript and JSX
- Vite for the development server and production build
- Native browser `fetch` for REST requests
- Existing Node.js and Express backend at `http://localhost:5000`

TypeScript, Redux, Context API, and custom hooks were not added.

## Features Implemented

- React.js application entry point
- Simple Reports navigation
- Report list loaded from `GET /api/reports`
- Report cards showing title, type, category, location, date, and status
- Loading message: `Loading reports...`
- Friendly request error state
- Empty result state: `No reports found.`
- Keyword search through the backend `search` query parameter
- Type filter through the backend `type` query parameter
- Category filter through the backend `category` query parameter
- Status filter through the backend `status` query parameter
- Clear-filters control
- Responsive desktop and mobile layout

## React.js Folder Structure

```text
client/
  .env.example
  index.html
  package.json
  vite.config.js
  src/
    App.jsx
    main.jsx
    styles.css
    components/
      Navigation.jsx
      ReportCard.jsx
      ReportFilters.jsx
      ReportList.jsx
    services/
      reportService.js
```

The generated `client/dist/` folder is a build output and is ignored by Git.

## Important Files

### `client/package.json`

Defines the React/Vite project, development command, production build command, and dependencies. The project uses JavaScript and JSX files with `.js` and `.jsx` extensions.

### `client/index.html`

Provides the browser HTML page and the `root` element where React mounts. It also defines the page title and viewport settings.

### `client/vite.config.js`

Enables the React plugin for Vite. Vite serves the client during development and bundles it for production.

### `client/src/main.jsx`

The frontend entry point. It finds the `root` element, renders `App`, and imports the shared stylesheet.

### `client/src/App.jsx`

Coordinates Unit 2 state and behavior:

- Stores the active search and filter values.
- Stores fetched reports.
- Tracks loading and error states.
- Requests reports whenever filters change.
- Passes data and callbacks to child components.

### `client/src/services/reportService.js`

The dedicated API service. It builds the query string from search and filter values, calls `/api/reports`, handles non-success responses, and returns parsed JSON. Components do not repeat the backend URL or fetch logic.

The default API base is:

```text
http://localhost:5000/api
```

It can be changed with `VITE_API_BASE_URL`.

### `client/src/components/Navigation.jsx`

Displays the application identity, the current Reports navigation link, and the number of reports currently shown.

### `client/src/components/ReportFilters.jsx`

Displays the keyword input and three select controls. Each change updates the filter state in `App`. Category options match the categories defined in the approved API design.

### `client/src/components/ReportList.jsx`

Chooses which list state to render:

1. Loading message while a request is active.
2. Error message when the request fails.
3. Empty message when the API returns no reports.
4. Report cards when reports are available.

### `client/src/components/ReportCard.jsx`

Displays one report's approved Unit 2 fields and formats its date for readable display. Lost and found reports receive distinct visual labels.

### `client/src/styles.css`

Contains the Unit 2 visual design, responsive layout, report card styles, form control styles, and feedback states. It does not add controls for later units.

### `client/.env.example`

Documents the optional frontend API configuration:

```text
VITE_API_BASE_URL=http://localhost:5000/api
```

## How React.js Communicates With Express

The frontend runs on port 5173 and the backend runs on port 5000. `reportService.js` sends HTTP requests from the browser to:

```text
http://localhost:5000/api/reports
```

The existing Unit 1 Express app allows the configured client origin `http://localhost:5173` through CORS. No backend code was changed for Unit 2.

The expected local URLs are:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

Using `127.0.0.1:5173` instead of `localhost:5173` causes the existing CORS origin check to reject the request because those are different browser origins. The documented localhost URL works with the approved Unit 1 configuration.

## API Service Flow

1. `App.jsx` keeps the current filters in state.
2. A filter change triggers the `useEffect` request.
3. `getReports(filters)` removes empty values.
4. `URLSearchParams` creates a query string.
5. `fetch` calls the Express API.
6. Non-2xx responses become friendly JavaScript errors.
7. Successful JSON is returned to `App.jsx`.
8. React stores the reports and re-renders the list.

For example:

```text
filters = { search: 'wallet', type: 'lost', category: '', status: 'active' }
GET /api/reports?search=wallet&type=lost&status=active
```

## Report Fetching Flow

On the initial render, the filters are empty. `App.jsx` requests:

```text
GET /api/reports
```

The Unit 1 route forwards the request to the report controller, which queries MongoDB and returns an array. The response is stored in React state and mapped into `ReportCard` components.

## Search Flow

Typing `wallet` updates the `search` filter. The service sends:

```text
GET /api/reports?search=wallet
```

Search remains server-side. The Unit 1 controller searches title, description, location, and category, so the client does not duplicate database filtering logic.

## Filter Flow

Select controls update the same filter object:

- Type: `type=lost` or `type=found`
- Category: `category=Bags`, for example
- Status: `status=active` or `status=resolved`

Multiple values are combined in one request. For example:

```text
GET /api/reports?search=wallet&type=lost&category=Accessories&status=active
```

The backend combines these filters, and the client displays only the returned results.

## Loading, Error, and Empty States

### Loading

`loading` starts as `true` and becomes `true` for each request. `ReportList` displays `Loading reports...` while the request is pending.

### Error

If `fetch` cannot connect or the API returns an error, the service throws a friendly message. `ReportList` renders it in an alert region. Technical stack traces are not shown.

### Empty

When the API returns an empty array, `ReportList` renders `No reports found.` This also covers valid searches and filter combinations with no matches.

## Important Implementation Decisions

- The service module centralizes the API base URL and fetch behavior.
- Search and filtering remain in the existing Express controller, preventing duplicated filtering rules in the browser.
- One `filters` object keeps the four related controls simple without a state-management library.
- The effect cleanup flag prevents a stale response from updating the screen after filters change or the component unmounts.
- The client uses the approved `localhost` origin so it matches Unit 1's CORS configuration.
- No later-unit actions are displayed or implemented.

## Testing and Verification Results

### Build

Command:

```text
cd client
npm install
npm run build
```

Result:

- Dependencies installed successfully.
- Vite production build passed.
- 34 modules transformed.
- No npm vulnerabilities reported.

### Development Server

Command:

```text
cd client
npm run dev -- --host 127.0.0.1
```

Result:

- Vite started successfully.
- Frontend served at `http://127.0.0.1:5173/` and verified through the CORS-compatible `http://localhost:5173/` URL.

### Browser Integration Checks

With the existing backend running at `http://localhost:5000`:

- Two real reports loaded from MongoDB through `GET /api/reports`.
- Report cards displayed title, type, category, location, date, and status.
- The initial loading message displayed before the response completed.
- With the backend unavailable, the friendly `Failed to fetch` error state displayed.
- A wallet keyword search returned one matching report.
- Selecting the Found type filter after the wallet search returned zero matching reports.
- Selecting Bags and Active produced the correct combined empty result for that current search combination.
- The empty state displayed `No reports found.`
- The API service and backend integration succeeded when using the documented `localhost` origin.

## Status

Unit 2 implementation and focused verification are complete and approved. Units 3 and 4 were subsequently completed and approved. Unit 5 is the final documentation unit.
