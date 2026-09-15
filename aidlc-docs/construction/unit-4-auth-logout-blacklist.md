# Construction Unit 4: Logout and Token Blacklist

## Status

Completed. Unit 4 implements authenticated logout and MongoDB JWT blacklist checks only.

## Scope

- Separate `blacklisted_tokens` Mongoose model with `token` and `expiresAt`.
- TTL index on `expiresAt` for automatic removal of expired records.
- `POST /api/auth/logout` protected by the existing JWT middleware.
- Exact-token blacklist lookup before accepting an authenticated request.
- Expired blacklist records are no longer considered active.

## Files Created or Modified

- Created `server/src/models/blacklistedToken.js`.
- Modified `server/src/middleware/authenticateToken.js` to query the blacklist model after JWT verification.
- Modified `server/src/controllers/authController.js` with the logout controller.
- Modified `server/src/routes/authRoutes.js` to mount authenticated logout.
- Modified `server/src/app.js` to inject the blacklist model through the existing MongoDB connection setup.
- Modified `server/test/auth.test.js` with logout and blacklist behavior tests.
- Created `server/test/blacklistedToken.test.js` with collection and TTL index checks.

No report routes, Report model, React code, `.env.example`, or unrelated functionality was changed.

## Validation

- `npm test` passed: 20 tests, including Unit 1, Unit 2, Unit 3, Unit 4, and report regression tests.
- Authenticated logout stores the exact token and expiration time and does not return the token.
- A non-expired blacklisted token returns `401` through the existing middleware.
- A valid non-blacklisted token remains accepted.
- Expired JWTs and expired blacklist records are rejected or ignored appropriately.
- Missing, malformed, and invalid tokens remain rejected with `401`.
- The blacklist model uses the separate `blacklisted_tokens` collection and a TTL index with `expireAfterSeconds: 0`.
- Static checks reported no errors in touched files.
- Existing report functionality passed regression tests; no MongoDB report data was deleted, reset, migrated, or modified.

## Approval Gate

- Unit 4 implementation and verification are complete.
- Approve Unit 4 before starting Unit 5: React.js Authentication.
- Do not begin React authentication, report protection, or later units until approval is recorded.
