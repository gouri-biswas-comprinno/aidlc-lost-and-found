# Construction Plan

## AI-DLC Stage

Elaboration: Units of Work

Construction will implement one approved unit at a time. Each unit has a narrow outcome and a focused validation step.

## Unit 1: Backend Foundation and Reports API

Create the Node.js/Express server, environment configuration, Mongoose connection, Report model, validation, routes, controllers, error handling, and API tests. Validate with server-side tests and a build/startup check.

## Unit 2: React.js JavaScript Application Shell and Report List

Create the React.js client application shell using JavaScript and JSX, navigation, report list, loading/error/empty states, API service, search, and filters. Validate with a client build and focused UI checks.

## Unit 3: Create and Edit Report Workflow

Add the shared report form for lost and found creation and editing, including client validation and success/error behavior. Validate form and API integration behavior.

## Unit 4: Details, Resolve, and Delete Workflow

Add report details, resolve action, delete confirmation, and navigation back to the list. Validate the complete lifecycle.

## Unit 5: Integration Verification and Documentation

Connect local client and server configuration, verify the end-to-end workflow against MongoDB Atlas, add README setup instructions, and run final build/test checks.

## Construction Rules

- Do not start a later unit until the current unit passes its focused validation.
- Keep each unit understandable and avoid adding features outside the approved requirements.
- Record implementation and verification notes in `aidlc-docs/construction/` as units complete.
