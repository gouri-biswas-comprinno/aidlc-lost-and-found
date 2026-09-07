# Unit 3: Create and Edit Report Workflow

## 1. Unit Goal

Unit 3 adds report creation and editing to the existing React.js report directory. Users can create a lost report, create a found report, and edit an existing report through one shared JavaScript/JSX form.

Unit 3 does not add report details, resolve, delete, authentication, image upload, messaging, matching, or deployment.

## 2. Features Implemented

- Create Lost Report action
- Create Found Report action
- Shared create/edit form
- Edit action on every report card
- Existing report loading before edit
- Client-side required-field validation
- Client-side basic email validation
- Friendly API error display
- Saving state on submit
- Success message after create or update
- List refresh after successful create or update
- Existing Unit 2 search and filters preserved

## 3. Files Created

### `client/src/components/ReportForm.jsx`

The shared form used for all Unit 3 workflows. It handles:

- Form state for every approved report field
- Create mode and edit mode
- Loading an existing report for editing
- Client-side validation
- Submit state
- API errors
- Success callback to the parent application

The form receives `reportId`, `initialType`, `onCancel`, and `onSuccess` properties from `App.jsx`.

### `aidlc-docs/construction/unit-3-create-edit-workflow.md`

This document records the actual Unit 3 implementation, decisions, and verification results.

## 4. Files Updated

### `client/src/services/reportService.js`

Added a small shared `request` helper and these service functions:

- `createReport(report)` sends `POST /api/reports`.
- `getReportById(id)` sends `GET /api/reports/:id`.
- `updateReport(id, report)` sends `PUT /api/reports/:id`.

The existing `getReports` function now uses the same request helper. The API base URL and error-message behavior remain centralized in this file.

### `client/src/App.jsx`

Added simple view state for the report list or shared form, the selected create type, the report being edited, success notices, and list refreshes. The existing filter state and report-fetching effect remain in place.

### `client/src/components/Navigation.jsx`

Added an `Add report` action that opens the shared form in lost-report create mode.

### `client/src/components/ReportCard.jsx`

Added an `Edit report` button that passes the current report ID to `App.jsx`.

### `client/src/components/ReportList.jsx`

Passes the edit callback to each report card. Loading, error, empty, and list behavior remain unchanged.

### `client/src/styles.css`

Added styles for create actions, form controls, validation messages, success messages, edit actions, and responsive form layout. Existing Unit 2 styles were preserved.

No Unit 1 backend files were changed, and no API contract was changed.

## 5. Shared Form Design

One `ReportForm` component supports all three workflows:

- Lost create mode receives `initialType="lost"`.
- Found create mode receives `initialType="found"`.
- Edit mode receives a `reportId`, loads the report, and fills the same controls.

This avoids duplicated forms while keeping the state and behavior visible in one beginner-friendly component. The type is selected correctly when either create action opens the form. Status is omitted from create payloads so the existing backend default remains responsible for setting new reports to `active`; status is shown and editable in edit mode.

## 6. Create Workflow

```text
User selects Create lost report or Create found report
        |
        v
ReportForm opens with type set to lost or found
        |
        v
User input is stored in React form state
        |
        v
Client validation checks required fields and email format
        |
        v
reportService.createReport sends POST /api/reports
        |
        v
Express route and controller validate the request
        |
        v
Mongoose stores the report in MongoDB Atlas
        |
        v
201 response returns the created report
        |
        v
App shows a success message, refreshes reports, and returns to the list
```

The created report appears at the top of the list because the existing backend sorts reports newest first.

## 7. Edit Workflow

```text
User selects Edit report
        |
        v
App stores the selected report ID and opens ReportForm
        |
        v
ReportForm calls GET /api/reports/:id
        |
        v
Existing values are loaded into the form controls
        |
        v
User updates the values
        |
        v
Client validation checks the updated values
        |
        v
reportService.updateReport sends PUT /api/reports/:id
        |
        v
Express controller updates MongoDB through Mongoose
        |
        v
Updated report response returns to React
        |
        v
App shows a success message, refreshes reports, and returns to the list
```

The edit form displays the existing title, type, category, description, location, date, contact name, contact email, and status.

## 8. Client-side Validation

The form checks these fields before a request is sent:

- Title
- Description
- Category
- Location
- Date
- Contact name
- Contact email

Required fields receive messages such as `Title is required.` The email uses a simple basic pattern and displays `Enter a valid email address.` when invalid.

This validation improves the user experience by catching obvious mistakes immediately. The backend and Mongoose schema remain the final source of truth, so client validation does not replace or weaken server validation.

## 9. Success and Error Handling

During submission, the button changes to `Saving...` and is disabled.

After a successful create, the application shows:

```text
Report created successfully.
```

After a successful update, it shows:

```text
Report updated successfully.
```

The report list is fetched again so the new or changed data is visible immediately.

If the API fails, the service reads the backend's `message` field when available. The form displays that message in an alert region. If the edit report cannot be loaded, the form shows the error and offers a Back to reports action. No stack traces are shown.

## 10. API Integration

### Create

```text
POST /api/reports
```

The body contains the approved report fields. New report status is omitted so the backend applies its existing `active` default.

### Load for Edit

```text
GET /api/reports/:id
```

The form calls this when an edit action opens.

### Update

```text
PUT /api/reports/:id
```

The body contains the complete form values, including status in edit mode. The existing Unit 1 controller validates and persists the update.

## 11. Important Design Decisions

- The existing single-page React structure was retained; no routing library or state-management library was added.
- The shared form uses ordinary `useState` and `useEffect` so the data flow is visible to a beginner.
- API calls remain in `reportService.js`; components do not repeat URLs or fetch parsing.
- The existing backend was not modified because its create, get-one, and update endpoints already supported the required behavior.
- Create actions are intentionally small and visible in the existing report-list screen.
- The existing Unit 2 filtering remains server-side and continues to use the same `filters` state.
- Status is available while editing but is not sent for new reports, preserving the backend default.
- No Unit 4 controls such as resolve or delete were added.

## 12. Testing and Verification Results

### Build Verification

Command:

```text
cd client
npm run build
```

Result:

- Passed after the Unit 3 integration changes.
- Passed again after the Unit 3 styling changes.
- Vite transformed 35 modules.
- No TypeScript files or TypeScript configuration were added.

### Create Lost Report

Verified in the browser against the running Express and MongoDB Atlas backend:

- Create Lost Report opens the shared form.
- The type is preselected as `lost`.
- Submitting an empty form displays required-field messages.
- Valid data was accepted through `POST /api/reports`.
- The UI displayed `Report created successfully.`
- The new lost report appeared in the list.

### Create Found Report

Verified in the browser:

- Create Found Report opens the same shared form.
- The type is preselected as `found`.
- Valid data was accepted through `POST /api/reports`.
- The UI displayed `Report created successfully.`
- The new found report appeared in the list with a Found item label.

### Edit Report

Verified in the browser:

- Edit report opens the shared form.
- Existing values were loaded through `GET /api/reports/:id`.
- The loaded report had the expected title, type `lost`, and category.
- The title and location were changed.
- `PUT /api/reports/:id` succeeded.
- The UI displayed `Report updated successfully.`
- The changed title and location appeared in the refreshed list.

### Error and Validation Checks

- Empty form submission displayed field-level required messages and did not create a report.
- Invalid email input displayed `Enter a valid email address.` and kept the user on the form.
- The service has friendly fallback errors for unavailable or non-JSON API responses.
- Edit loading errors are displayed without technical stack traces.

### Unit 2 Regression Checks

Verified after Unit 3 changes:

- Report list continued to display backend data.
- Keyword search returned the expected matching report.
- Type filter returned the expected found reports.
- Category filter returned the expected Bags reports.
- Status filter returned the expected active reports.
- Navigation remained available.
- Existing loading, error, and empty-state code remained active and unchanged in behavior.

## Status

Unit 3 implementation and focused verification are complete.

## Approval

- Unit: Unit 3 - Create and Edit Report Workflow
- Decision: Approved and completed
- Approved by: Project owner
- Date: 2026-09-07
- GitHub actions: Performed by the project owner; none performed by the assistant.

## Workflow Position

Unit 3 is complete. Unit 4 is now the active construction unit.
