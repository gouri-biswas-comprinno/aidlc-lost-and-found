# Construction Unit 1: User Model and Signup API

## Status

Completed. Unit 1 implements the approved User model and signup flow only.

## Scope

- Separate Mongoose `User` model for the `users` collection.
- Normalized, unique email addresses.
- Bcrypt password hashing before persistence.
- Signup validation and `POST /api/auth/signup`.
- Safe signup responses that omit `passwordHash`.

## Files Created or Modified

- Created `server/src/models/user.js`.
- Created `server/src/validation/authValidation.js`.
- Created `server/src/controllers/authController.js`.
- Created `server/src/routes/authRoutes.js`.
- Modified `server/src/app.js` to inject the User model and mount auth routes.
- Created `server/test/auth.test.js`.
- Added the `bcrypt` server dependency.

No report model, report route, report controller, or report data was changed. No `.env.example` was created or modified.

## Validation

- `npm test` passed: 7 tests, including signup and existing report regression tests.
- Valid signup returns `201` with normalized email and safe user information.
- Stored passwords are bcrypt hashes and compare successfully without storing plaintext.
- Duplicate normalized emails return `409` with a clear error.
- Invalid signup input returns `400` before persistence.
- Signup responses do not contain `passwordHash`.
- Existing report tests continue to pass; no live MongoDB report data was reset, migrated, or modified.

## Approval Gate

- Unit 1 implementation and verification are complete.
- Approve Unit 1 before starting Unit 2: Login API and JWT.
- Do not begin JWT generation, login, logout, blacklist, or later units until approval is recorded.
