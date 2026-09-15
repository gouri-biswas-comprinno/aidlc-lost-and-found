# Construction Unit 3: JWT Authentication Middleware

## Status

Completed. Unit 3 implements JWT request authentication only.

## Scope

- Bearer token extraction from the `Authorization` header.
- JWT signature and expiration verification using `JWT_SECRET`.
- Authenticated user identifier attached as `request.userId`.
- Clear `401` responses for missing, malformed, invalid, and expired tokens.
- Optional blacklist-check hook prepared for Unit 4 without blacklist storage.

## Files Created or Modified

- Created `server/src/middleware/authenticateToken.js`.
- Created `server/test/authenticateToken.test.js`.

No existing application files, report routes, report model, logout flow, blacklist model, blacklist records, React code, or `.env.example` were changed.

## Validation

- `npm test` passed: 16 tests, including Unit 1, Unit 2, middleware, and existing report regression tests.
- Missing and malformed Authorization headers return `401`.
- Invalid and expired JWTs return `401`.
- Valid JWTs are accepted and attach the authenticated user ID to `request.userId`.
- The middleware exposes an injectable blacklist check for the approved Unit 4 design, defaulting to no blacklist lookup until implemented.
- Static checks reported no errors in the new files.
- No MongoDB report data was deleted, reset, migrated, or modified.

## Approval Gate

- Unit 3 implementation and verification are complete.
- Approve Unit 3 before starting Unit 4: Logout and Token Blacklist.
- Do not begin logout, blacklist model/records, report protection, or React authentication until approval is recorded.
