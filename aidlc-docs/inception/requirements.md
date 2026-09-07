# Lost-and-Found Application Requirements

## AI-DLC Stage

Inception: Requirements Discovery

## Product Goal

Provide a simple local web application for reporting lost and found items, discovering matching reports, and managing report lifecycle.

## Confirmed Scope

- No user accounts or authentication in the evaluation version.
- Reports are publicly manageable.
- Local development and evaluation in VS Code.
- MongoDB Atlas connection configured through environment variables.
- Keep the implementation intentionally small and understandable.

## Functional Requirements

1. Users can create a lost-item report.
2. Users can create a found-item report.      
3. Users can view all reports.
4. Users can search reports by keyword.
5. Users can filter reports by report type, category, and status.
6. Users can view the details of one report.
7. Users can update a report.
8. Users can mark a report as resolved.
9. Users can delete a report.

## Report Data

Each report contains:

- `title`: short item name
- `description`: useful identifying details
- `type`: `lost` or `found`
- `category`: selectable item category
- `location`: where the item was lost or found
- `date`: date associated with the incident
- `contactName`: contact person's name
- `contactEmail`: contact email address
- `status`: `active` or `resolved`
- creation and update timestamps managed by the database

No phone number or image URL is included in the first version.

## Validation Rules

- Title, description, type, category, location, date, contact name, and contact email are required.
- Type must be `lost` or `found`.
- Status must be `active` or `resolved`.
- Contact email must have a valid basic email format.
- Invalid requests return a clear client error and do not write to the database.

## Non-Functional Requirements

- React frontend using JavaScript.
- Node.js and Express backend.
- MongoDB Atlas accessed through Mongoose.
- REST API between frontend and backend.
- Responsive layout suitable for desktop and mobile.
- Configuration secrets remain in environment variables and are excluded from version control.
- Errors and empty states are visible and understandable.

## Out Of Scope

- Authentication, authorization, and per-user ownership.
- File uploads or image storage.
- Messaging between reporters.
- Automatic matching or notifications.
- Maps, geolocation, and production hosting setup.

## Acceptance Criteria

- A user can complete the full create, view, search/filter, detail, update, resolve, and delete flows from the browser.
- Lost and found reports are visibly distinguishable.
- Search and filters can be combined.
- Resolved reports remain viewable but are identifiable as resolved.
- Refreshing the browser preserves data because reports are stored in MongoDB Atlas.
- The project includes setup instructions, environment variable documentation, and test/build verification commands.

## Decisions To Confirm At Gate

- Approve this requirements scope.
- Request changes to fields, validation, or out-of-scope items.
