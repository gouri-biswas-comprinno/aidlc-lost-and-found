# Construction Unit 2: Login API and JWT

## Status

Completed. Unit 2 implements the approved login and JWT flow only.

## Scope

- `POST /api/auth/login`.
- Normalized email lookup and bcrypt password verification.
- Signed JWT using `JWT_SECRET` and `JWT_EXPIRES_IN`.
- JWT payload limited to the user identifier and standard `iat`/`exp` claims.
- Safe user response without `passwordHash`.

## Files Created or Modified

- Modified `server/src/validation/authValidation.js` with login validation.
- Modified `server/src/controllers/authController.js` with password verification and JWT generation.
- Modified `server/src/routes/authRoutes.js` to mount `/login`.
- Modified `server/src/app.js` to pass JWT configuration through the existing app factory.
- Modified `server/test/auth.test.js` with login and JWT tests.
- Added the `jsonwebtoken` server dependency.

No logout, blacklist, JWT middleware, report functionality, report model, or report data was changed. No `.env.example` was created or modified.

## Validation

- `npm test` passed: 10 tests, including all Unit 1 and existing report regression tests.
- Successful login accepts normalized email and returns a signed JWT with safe user information.
- Wrong passwords and unknown emails return `401` without a token.
- Malformed login input returns `400` before authentication.
- JWT verification confirms the expected user identifier, finite expiration, and only `sub`, `iat`, and `exp` claims.
- Login responses do not contain `passwordHash`.
- Static checks reported no errors in touched files.

## Approval Gate

- Unit 2 implementation and verification are complete.
- Approve Unit 2 before starting Unit 3: JWT Authentication Middleware.
- Do not begin logout, blacklist, middleware, React authentication, or report protection until approval is recorded.
