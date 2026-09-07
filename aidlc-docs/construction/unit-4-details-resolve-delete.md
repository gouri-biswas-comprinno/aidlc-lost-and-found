# Unit 4: Details, Resolve, and Delete Workflow

## 1. Unit Goal

Unit 4 extends the existing React.js application so users can open complete report details, return to the report list, mark active reports as resolved, and permanently delete reports after browser confirmation.

The implementation uses the existing Unit 1 backend APIs and does not add authentication, authorization, image upload, messaging, automatic matching, notifications, maps, or deployment.

## 2. Features Implemented

- View details action on every report card
- Complete report details view
- Back to reports navigation
- Edit action from the details view
- Resolve action for active reports
- Resolved status display
- Resolve action hidden after resolution
- Delete action with browser confirmation
- Delete cancellation without an API request
- Delete success navigation back to the list
- List refresh after resolve and delete
- Details loading state
- Details load error state
- Resolve and delete action errors
- Friendly success messages

## 3. Files Created

### `client/src/components/ReportDetails.jsx`

Loads and displays one complete report using its ID. It owns the details loading state, details error state, resolve action, delete confirmation, action loading state, and action messages.

It receives these callbacks from `App.jsx`:

- `onBack`: return to the list.
- `onEdit`: open the existing shared edit form.
- `onChanged`: refresh list data after resolving.
- `onDeleted`: return to the list with a deletion success message.

### `aidlc-docs/construction/unit-4-details-resolve-delete.md`

Documents the actual Unit 4 implementation and verification results.

## 4. Files Updated

### `client/src/services/reportService.js`

Added:

- `resolveReport(id)` for `PATCH /api/reports/:id/resolve`.
- `deleteReport(id)` for `DELETE /api/reports/:id`.

Both use the existing centralized request helper, so URL construction, JSON parsing, and friendly error handling remain in one place.

### `client/src/App.jsx`

Added a `details` view alongside the existing `list` and `form` views. It stores the selected report ID and connects the details callbacks to list refresh, edit navigation, back navigation, and delete success behavior.

The existing filters, create flow, edit flow, and report loading effect remain in place.

### `client/src/components/ReportCard.jsx`

Added a `View details` action next to the existing `Edit report` action. The selected report ID is passed to `App.jsx`.

### `client/src/components/ReportList.jsx`

Passes the details callback to each report card. Existing loading, error, empty, and list rendering remain unchanged.

### `client/src/styles.css`

Added details layout, complete metadata grid, action buttons, danger styling for delete, and responsive details behavior. Existing Unit 2 and Unit 3 styles were preserved.

No Unit 1 backend files were changed. The existing route, controller, model, and MongoDB contract were reused unchanged.

## 5. Report Details Flow

```text
User clicks View details
        |
        v
App stores the selected report ID and switches to details view
        |
        v
ReportDetails calls getReportById(id)
        |
        v
GET /api/reports/:id
        |
        v
Express route -> report controller -> Mongoose
        |
        v
MongoDB returns the report
        |
        v
ReportDetails renders complete report details
```

The details view displays:

- Title
- Description
- Type
- Category
- Location
- Date
- Contact name
- Contact email
- Status
- Created date when available
- Last updated date when available

While loading, the UI displays `Loading report details...`. If loading fails, the UI displays the API error message and a Back to reports button.

## 6. Resolve Flow

```text
User opens an active report
        |
        v
User clicks Mark as resolved
        |
        v
resolveReport(id) sends PATCH /api/reports/:id/resolve
        |
        v
Express controller updates status in MongoDB
        |
        v
Updated report response returns to ReportDetails
        |
        v
Details status changes to resolved
        |
        v
Success message displays and the resolve action disappears
```

The action is rendered only when `report.status === 'active'`. Once the response contains `resolved`, the button is no longer rendered. The list is refreshed through `onChanged`, so returning to the list shows the updated status.

Resolve failures remain on the details view and appear as a friendly action error.

## 7. Delete Flow

```text
User opens report details
        |
        v
User clicks Delete report
        |
        v
window.confirm asks for confirmation
        |
        +--> Cancel: no DELETE request; details remain unchanged
        |
        +--> Confirm: deleteReport(id) sends DELETE /api/reports/:id
                         |
                         v
                   MongoDB deletes the report
                         |
                         v
                   App returns to list and refreshes reports
```

The browser's built-in confirmation is used because it requires no new library and clearly pauses before the irreversible operation. If deletion fails, the details view remains open and displays the error.

## 8. API Integration

### Get One Report

```text
GET /api/reports/:id
```

Used when the details view opens. The backend returns `200` with one report, `400` for an invalid ID, or `404` when no report exists.

### Resolve Report

```text
PATCH /api/reports/:id/resolve
```

Used only for active reports. The backend returns the updated report with `status: "resolved"`.

### Delete Report

```text
DELETE /api/reports/:id
```

Used only after browser confirmation. The backend returns `204 No Content` when deletion succeeds.

## 9. Important Design Decisions

- The existing single-page view-state approach was retained instead of introducing a routing library.
- Details is a separate rendered view so the existing report list remains simple and the selected report has room for all fields.
- The selected report ID is stored in `App.jsx`, then passed to `ReportDetails` for the API request.
- Resolve is available only for active reports because resolving an already-resolved report is not a useful user action.
- Browser confirmation is used for delete because it is simple, native, and appropriate for a destructive action.
- API calls remain in `reportService.js`; components do not contain repeated URLs or fetch parsing.
- The list refreshes after resolve and delete so the UI reflects MongoDB rather than relying only on local assumptions.
- The existing edit action remains available from details, so Unit 3's workflow is preserved.

## 10. Testing and Verification Results

### Build Verification

Command:

```text
cd client
npm run build
```

Result:

- Build passed after adding the details component and service functions.
- Build passed after wiring the details view into `App.jsx`.
- Build passed after adding Unit 4 styles.
- Vite transformed 36 modules.
- No TypeScript files or TypeScript configuration were added.

### Details View

Verified against the running Express and MongoDB Atlas backend:

- A report opened through `View details`.
- The selected report ID loaded the correct report.
- Title, description, type, category, location, date, contact name, contact email, status, created time, and updated time displayed.
- `Loading report details...` is implemented for the request period.
- Back to reports returned to the existing list.

### Resolve

Verified against MongoDB:

- An active report displayed `Mark as resolved`.
- The PATCH request succeeded.
- The details status changed from `active` to `resolved`.
- `Report marked as resolved.` displayed.
- The resolve button was absent after resolution.
- Returning to the list showed the report with resolved status.

### Delete

Verified against MongoDB:

- Delete opened the browser confirmation: `Are you sure you want to delete this report?`
- Cancelling left the details view and report unchanged.
- Confirming sent the DELETE request.
- The UI displayed `Report deleted successfully.`
- The application returned to the list.
- The deleted report no longer appeared and the displayed count decreased from 6 to 5.

### Regression Checks

The existing list remained functional after Unit 4 changes, including:

- Report cards
- Navigation
- Existing Edit report action
- Existing create actions
- Existing search and filters
- Existing list refresh behavior

No backend API or MongoDB integration code was modified.

## Status

Unit 4 implementation and focused verification are complete and approved. Unit 5 is the final documentation unit.
