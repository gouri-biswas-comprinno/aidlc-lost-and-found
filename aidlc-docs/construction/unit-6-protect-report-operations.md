# Construction Unit 6: Protect Existing Report Operations

## Status

Completed. Unit 6 applies the existing JWT middleware to report-changing operations only.

## Scope

Public report operations remain available without authentication:

- `GET /api/reports`
- `GET /api/reports/:id`

Protected report operations now require a valid, non-blacklisted JWT:

- `POST /api/reports`
- `PUT /api/reports/:id`
- `PATCH /api/reports/:id/resolve`
- `DELETE /api/reports/:id`

## Files Created or Modified

- Modified `server/src/routes/reportRoutes.js` to apply the existing `authenticateToken` middleware to write routes.
- Modified `server/src/app.js` to pass the existing JWT and blacklist configuration into report routes.
- Modified `server/test/reports.test.js` with public-read, protected-write, token-error, and valid-operation coverage.

No report controller, Report model, frontend report service, authentication middleware, `.env.example`, or MongoDB report data was changed.

## Validation

- `npm test` passed: 23 tests, including Units 1–5 authentication tests and report regression tests.
- Missing, malformed, invalid, expired, and blacklisted tokens return `401` for protected report writes.
- Valid non-blacklisted JWTs reach the existing report controller successfully for create, update, resolve, and delete.
- Public list, detail, search, and filter behavior remains available without authentication.
- The existing frontend `reportService.js` continues using `getAuthHeaders()` to send `Authorization: Bearer <token>` when a token is stored; no report operation rewrite was needed.
- `npm run build` passed for the React client.
- Static checks reported no errors in touched files.
- No MongoDB report data was deleted, reset, migrated, or modified.

## Approval Gate

- Unit 6 implementation and verification are complete.
- Approve Unit 6 before starting Unit 7: Testing and Integration.
- Do not begin final integration/documentation work until approval is recorded.
