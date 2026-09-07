# Lost-and-Found Solution Design

## AI-DLC Stage

Elaboration: Solution Design

## Design Goal

Build the smallest complete full-stack application that satisfies the approved requirements while keeping responsibilities easy for a beginner to understand.

## Architecture

The application has three parts:

1. **React.js client written in JavaScript**: displays the report list, search and filter controls, report forms, and report details. It calls the REST API and displays loading, empty, success, and error states.
2. **Express API**: receives HTTP requests, validates request data, calls the report data layer, and returns JSON responses with appropriate status codes.
3. **MongoDB Atlas through Mongoose**: stores reports in one collection and provides schema validation, timestamps, and database access.

For local development, the React development server runs separately from the Express server. The client uses a configurable API base URL. Express reads the MongoDB connection string from an environment variable.

## Responsibilities and Boundaries

- React must not connect directly to MongoDB.
- Express must not contain presentation or browser-specific logic.
- The Mongoose model must define allowed values and required fields.
- The API is the single source of truth for validation and report status changes.
- No authentication middleware is needed because public management was approved for this evaluation scope.

## Proposed Folder Structure

```text
/
  aidlc-docs/
  client/
    src/
      components/
      pages/
      services/
        App.jsx
        main.jsx
  server/
    src/
      config/
      controllers/
      middleware/
      models/
      routes/
      app.js
      server.js
  .env.example
  .gitignore
  README.md
```

The client is explicitly a React.js application using JavaScript and JSX. The `.jsx` extension identifies JavaScript files that contain JSX markup; no TypeScript is planned. The exact filenames may be simplified during Construction if the implementation remains clear and follows these ownership boundaries.

## User Experience

### Report List

The first screen shows a clear heading, actions to create lost or found reports, search input, type/category/status filters, and a responsive list of report summaries. Each summary shows title, type, category, location, date, and status. Empty and failed-loading states are explicit.

### Create and Edit Form

One shared form supports both lost and found reports. The form captures all required fields, shows field-level validation messages, and submits to the appropriate API operation. Edit mode is prefilled and uses the same validation.

### Report Details

The details view shows every report field, status, and actions for edit, resolve, and delete. Resolve is available only while the report is active. Delete requires a browser confirmation before the API call.

### Visual Direction

Use a restrained civic-service interface: a light neutral canvas, strong charcoal text, and separate amber/teal accents for lost/found states. The layout prioritizes scanning and repeated management actions over decoration. It must remain usable on narrow screens.

## Data Flow

1. A user interacts with a React page.
2. A client service sends an HTTP request to Express.
3. Express route middleware validates the request shape.
4. The controller calls the Mongoose `Report` model.
5. MongoDB Atlas returns the result.
6. Express sends a consistent JSON response.
7. React updates local screen state and renders the result or an error message.

## Error Strategy

- `400`: invalid input or invalid query values.
- `404`: report does not exist.
- `500`: unexpected server or database failure.
- API errors use `{ "message": "Human-readable explanation" }`.
- The client displays API messages without exposing stack traces.

## Security and Configuration

- `MONGODB_URI` and `PORT` are read from environment variables.
- The real `.env` file is ignored by Git.
- Mongoose queries use structured query construction rather than raw user-provided database expressions.
- Request bodies are limited to JSON and receive basic size limits.
- CORS is restricted to the local client origin through configuration where needed.

## Design Risks and Mitigations

- **Public delete/update access**: accepted as a deliberate evaluation tradeoff; authentication is out of scope.
- **Atlas unavailable**: startup should report a clear connection error, and README setup instructions should explain the required environment variable.
- **Different client/server ports**: use a documented API base URL and CORS configuration.

## Design Acceptance

This design is ready for the human approval gate. Construction must not begin until this design and the units of work are approved.
