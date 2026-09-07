# Lost-and-Found Application

## Project Overview

This local full-stack application helps users report lost and found items and manage those reports. Users can view reports, search and filter them, create lost or found reports, edit reports, view complete details, mark reports as resolved, and delete reports.

The current evaluation version has no authentication or user ownership.

## Technology Stack

### Frontend

- React.js
- JavaScript
- JSX
- HTML/CSS
- Vite

### Backend

- Node.js
- Express.js
- REST APIs

### Database

- MongoDB Atlas
- Mongoose

### Development

- VS Code
- Git
- GitHub
- GitHub Copilot / AI-assisted development
- AWS AIDLC workflow

## Architecture

```text
React.js Frontend
        |
        v
API Service
        |
        v
Express.js Backend
        |
        v
Routes
        |
        v
Controllers
        |
        v
Mongoose
        |
        v
MongoDB Atlas
```

The React.js frontend displays the application and manages temporary screen and form state. The API service keeps HTTP communication in one place.

Express.js receives requests and sends responses. Routes map HTTP methods and URLs to controller functions. Controllers validate input and coordinate application behavior.

Mongoose defines the `Report` model and reads and writes documents in the MongoDB Atlas `reports` collection.

## Completed Features

- Create a lost-item report
- Create a found-item report
- View all reports
- Search reports by keyword
- Filter reports by type, category, and status
- View complete report details
- Edit reports
- Mark active reports as resolved
- Delete reports after browser confirmation
- Loading, error, empty, validation, and success messages

## Project Structure

Generated dependency folders and build output are omitted below.

```text
AIDLC-LostAndFound/
  .gitignore
  README.md
  aidlc-docs/
    inception/
      requirements.md
    design/
      solution-design.md
      api-and-data-model.md
      construction-plan.md
      approval.md
    construction/
      unit-1.md
      unit-2-react-report-list.md
      unit-3-create-edit-workflow.md
      unit-4-details-resolve-delete.md
      unit-5-final-documentation.md
  client/
    .env.example
    index.html
    package.json
    package-lock.json
    vite.config.js
    src/
      App.jsx
      main.jsx
      styles.css
      components/
        Navigation.jsx
        ReportCard.jsx
        ReportDetails.jsx
        ReportFilters.jsx
        ReportForm.jsx
        ReportList.jsx
      services/
        reportService.js
  server/
    .env
    .env.example
    package.json
    package-lock.json
    src/
      app.js
      server.js
      controllers/
        reportController.js
      middleware/
        errorHandler.js
      models/
        report.js
      routes/
        reportRoutes.js
      validation/
        reportValidation.js
    test/
      reports.test.js
```

Important folders and files:

- `client/src/components/`: React.js UI components.
- `client/src/services/reportService.js`: frontend API communication.
- `client/src/App.jsx`: top-level view and state coordination.
- `server/src/routes/`: Express endpoint definitions.
- `server/src/controllers/`: request processing and response behavior.
- `server/src/models/report.js`: Mongoose report schema and model.
- `server/src/validation/`: request and filter validation.
- `server/src/middleware/errorHandler.js`: API error responses.
- `aidlc-docs/`: requirements, design, construction, and final documentation.

The real `server/.env` file is local configuration and is not documented with its contents.

## API Endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/reports` | List reports. Supports `search`, `type`, `category`, and `status` query parameters. |
| `GET` | `/api/reports/:id` | Return one complete report. |
| `POST` | `/api/reports` | Create a lost or found report. |
| `PUT` | `/api/reports/:id` | Update an existing report. |
| `PATCH` | `/api/reports/:id/resolve` | Mark an active report as resolved. |
| `DELETE` | `/api/reports/:id` | Permanently delete a report. |

## Local Development

The frontend and backend run separately. MongoDB Atlas stores the report data.

### Backend

From the project root:

```text
cd server
npm install
npm start
```

The backend uses the existing local `server/.env` file and runs on the configured backend port, currently `5000`.

### Frontend

In a second terminal:

```text
cd client
npm install
npm run dev
```

The React.js development server runs on the configured Vite port, currently `5173`.

Use the existing local configuration. Do not commit `server/.env` or expose its values.

## Environment Variables

The backend requires these concepts in `server/.env`:

```text
PORT=5000
MONGODB_URI=your_mongodb_connection_string
CLIENT_ORIGIN=http://localhost:5173
```

The frontend may use:

```text
VITE_API_BASE_URL=http://localhost:5000/api
```

These are placeholders only. The real MongoDB URI belongs only in the local `server/.env` file. The existing `.env.example` files are safe templates; no additional environment files are required.

## AIDLC Development Process

### Unit 1: Backend Foundation and Reports API

Created the Node.js/Express backend, Mongoose report model, validation, REST routes, controllers, error handling, MongoDB Atlas connection, and API tests.

### Unit 2: React.js Report List, Search, and Filters

Created the React.js JavaScript/JSX frontend shell, report list, API service, navigation, loading/error/empty states, search, and server-backed filters.

### Unit 3: Create and Edit Report Workflow

Added one shared React.js form for lost reports, found reports, and editing existing reports, including client-side validation and success/error behavior.

### Unit 4: Details, Resolve, and Delete Workflow

Added complete report details, back navigation, active-report resolution, browser-confirmed deletion, and list updates after changes.

### Unit 5: Final Documentation

Reviewed the completed project and documented the actual architecture, features, folder structure, API contract, local setup, AIDLC journey, validation status, and future improvements. This unit did not change application code or perform database operations.

## Testing and Verification

Units 1–4 were implemented and manually validated during development. The existing Unit 1 backend test file is located at `server/test/reports.test.js`.

The Unit 5 activity was documentation-only. It did not run new tests, change test code, change configuration, or perform database operations.

## Future Improvements

These are future possibilities and are not current features:

- Authentication
- User ownership of reports
- Image upload
- Automatic matching
- Notifications
- Deployment
