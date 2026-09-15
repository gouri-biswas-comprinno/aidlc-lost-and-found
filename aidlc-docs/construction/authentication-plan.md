# JWT Authentication Construction Plan

## AI-DLC Stage

Construction: Units of Work

Construction will implement one approved unit at a time. Each unit must pass its verification and approval gate before the next unit begins. Existing report data must remain intact, and `.env.example` must not be created or modified.

## Unit 1: User Model and Signup API

### Goal

Create the separate User model and allow a user to sign up with a securely hashed password.

### Files Likely To Be Created/Modified

- Create `server/src/models/user.js`.
- Create `server/src/validation/authValidation.js`.
- Create or modify `server/src/controllers/authController.js`.
- Create `server/src/routes/authRoutes.js`.
- Modify `server/src/app.js` only after inspecting it to mount the auth routes.

### Main Tasks

- Define the `users` collection with name, normalized email, password hash, and timestamps.
- Validate required signup fields and basic email/password rules.
- Reject duplicate email addresses.
- Hash passwords before saving and never return the hash.
- Return safe user information with a successful signup response.

### Verification/Testing

- Test valid signup and safe response data.
- Test missing or invalid fields and duplicate email handling.
- Confirm the stored password is hashed and the `reports` collection is unchanged.

### Approval Gate

Approve the User model and signup API before starting Unit 2.

## Unit 2: Login API and JWT

### Goal

Authenticate registered users and return a signed JWT after successful login.

### Files Likely To Be Created/Modified

- Modify `server/src/controllers/authController.js` after inspecting Unit 1 changes.
- Modify `server/src/routes/authRoutes.js` after inspecting the existing route definitions.
- Modify `server/src/app.js` only if login configuration or route wiring requires it.

### Main Tasks

- Validate login input and find the user by normalized email.
- Compare the supplied password with the stored hash.
- Return `401` for invalid credentials without generating a token.
- Sign a JWT containing only the user identifier and expiration data.
- Return the JWT and safe user information.

### Verification/Testing

- Test successful login and JWT response.
- Verify the token contains the expected user identifier and finite expiration.
- Test unknown users, incorrect passwords, and malformed input.

### Approval Gate

Approve login and JWT generation before starting Unit 3.

## Unit 3: JWT Authentication Middleware

### Goal

Validate bearer tokens and make the authenticated user available to protected requests.

### Files Likely To Be Created/Modified

- Create `server/src/middleware/authenticateToken.js`.
- Create or modify `server/src/models/blacklistedToken.js` only as needed for blacklist checks.
- Modify route files only after inspecting their current middleware order.

### Main Tasks

- Extract the token from the `Authorization: Bearer <token>` header.
- Reject missing or malformed bearer tokens.
- Reject a matching non-expired blacklist record.
- Verify the JWT signature and expiration using `JWT_SECRET`.
- Attach the user identifier to the request and return clear `401` errors when invalid.

### Verification/Testing

- Test missing, malformed, expired, and invalid-signature tokens.
- Test a valid token reaches a protected handler.
- Test a non-expired blacklisted token is rejected.
- Confirm middleware does not alter report documents.

### Approval Gate

Approve token extraction, verification, and blacklist checking before starting Unit 4.

## Unit 4: Logout and Token Blacklist

### Goal

Invalidate logged-out JWTs using a separate MongoDB blacklist collection and remove the token from the client.

### Files Likely To Be Created/Modified

- Create `server/src/models/blacklistedToken.js`.
- Modify `server/src/controllers/authController.js` to add the token on logout.
- Modify `server/src/routes/authRoutes.js` to protect logout.
- Modify `server/src/middleware/authenticateToken.js` if blacklist expiry checks need adjustment.
- Do not modify the existing Report model or report data.

### Main Tasks

- Store only `token` and `expiresAt` in the separate `blacklisted_tokens` collection.
- Add the current token on authenticated logout.
- Ignore expired blacklist records and allow their removal through expiry handling such as a TTL index.
- Remove the token and user state from the React client after logout.
- Use the existing MongoDB connection without reset, migration, or destructive changes.

### Verification/Testing

- Test authenticated logout creates one blacklist record with the required fields.
- Confirm the logged-out token is rejected until its expiration.
- Confirm expired entries are no longer considered valid.
- Confirm existing reports and the `reports` collection are unchanged.

### Approval Gate

Approve logout and MongoDB blacklist behavior before starting Unit 5.

## Unit 5: React.js Authentication

### Goal

Add a small React authentication flow using the existing client structure and navigation component.

### Files Likely To Be Created/Modified

- Create `client/src/services/authService.js`.
- Create a small auth form component only if the existing components cannot support signup and login clearly.
- Modify `client/src/App.jsx` after inspecting its current view and state flow.
- Modify the existing `client/src/components/Navigation.jsx` for auth actions; do not create a duplicate navigation component.
- Modify `client/src/services/reportService.js` to attach the JWT where required.

### Main Tasks

- Add signup and login forms with basic client validation.
- Store the returned JWT and safe user state in the simplest consistent client storage/state approach.
- Add the bearer token to protected API requests.
- Show logged-in state and provide logout.
- Handle authentication errors without exposing sensitive data.

### Verification/Testing

- Test signup, login, persisted auth state, and logout from the browser.
- Confirm protected requests include the bearer token and public report reads still load.
- Confirm the client removes the token after logout and does not create a duplicate navigation component.

### Approval Gate

Approve the React authentication flow before starting Unit 6.

## Unit 6: Protect Existing Report Operations

### Goal

Require JWT authentication for report changes while keeping report discovery public and preserving all existing data.

### Files Likely To Be Created/Modified

- Modify `server/src/routes/reportRoutes.js` after inspecting each existing route.
- Modify `client/src/services/reportService.js` only as needed for protected requests.
- Modify existing report UI components only if they need to handle authentication errors.
- Do not modify the Report model or existing report records.

### Main Tasks

- Protect `POST /api/reports`, `PUT /api/reports/:id`, `PATCH /api/reports/:id/resolve`, and `DELETE /api/reports/:id`.
- Keep `GET /api/reports` and `GET /api/reports/:id` public, including search and filter behavior.
- Inspect every existing file before modifying it and keep changes at the route/client request boundary.
- Preserve validation, response behavior, and report lifecycle functionality.
- Do not delete, reset, migrate, or modify existing MongoDB reports data.

### Verification/Testing

- Confirm unauthenticated report writes return `401`.
- Confirm authenticated create, update, resolve, and delete operations work.
- Confirm public list, detail, search, and filter operations work.
- Confirm existing report records and fields remain unchanged unless a requested operation explicitly changes one.

### Approval Gate

Approve report protection and regression behavior before starting Unit 7.

## Unit 7: Testing and Integration

### Goal

Verify the complete authentication feature and its compatibility with the existing Lost-and-Found application.

### Files Likely To Be Created/Modified

- Create or extend `server/test/auth.test.js`.
- Modify existing server tests only when authentication changes their request setup.
- Add focused client tests only if the existing client test setup supports them.
- Update documentation only after implementation is complete; do not modify `.env.example`.

### Main Tasks

- Test signup validation and password hashing behavior.
- Test login, JWT generation, invalid credentials, and token expiration handling.
- Test protected API access and public report reads.
- Test logout and MongoDB blacklist rejection/expiry behavior.
- Run frontend/backend integration checks and existing Lost-and-Found regression tests.
- Confirm no unrelated refactoring or feature work was introduced.

### Verification/Testing

- Run the server test suite and focused authentication tests.
- Run the client build and available frontend checks.
- Verify end-to-end signup, login, protected report operation, logout, and public browsing flows.
- Verify MongoDB `reports` data was not deleted, reset, migrated, or modified destructively.
- Verify no sessions, refresh tokens, OAuth, roles, OTP, 2FA, password reset, or unrelated features were added.

### Approval Gate

Approve final authentication integration and regression results before considering the Construction stage complete.
