import assert from 'node:assert/strict';
import express from 'express';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import { test } from 'node:test';
import { createAuthenticateToken } from '../src/middleware/authenticateToken.js';

const jwtSecret = 'unit-test-secret';
const userId = '507f1f77bcf86cd799439021';

function createProtectedApp() {
  const app = express();
  app.get('/protected', createAuthenticateToken({ jwtSecret }), (request, response) => {
    response.json({ userId: request.userId });
  });
  return app;
}

test('rejects a missing Authorization header', async () => {
  const response = await request(createProtectedApp()).get('/protected');

  assert.equal(response.status, 401);
  assert.equal(response.body.message, 'Authorization header is required.');
});

test('rejects an invalid Authorization format', async () => {
  const response = await request(createProtectedApp())
    .get('/protected')
    .set('Authorization', 'Basic token-value');

  assert.equal(response.status, 401);
  assert.equal(response.body.message, 'Authorization header must use Bearer token format.');
});

test('rejects an invalid JWT', async () => {
  const response = await request(createProtectedApp())
    .get('/protected')
    .set('Authorization', 'Bearer not-a-jwt');

  assert.equal(response.status, 401);
  assert.equal(response.body.message, 'Token is invalid.');
});

test('rejects an expired JWT', async () => {
  const token = jwt.sign({ sub: userId }, jwtSecret, { expiresIn: -1 });
  const response = await request(createProtectedApp())
    .get('/protected')
    .set('Authorization', `Bearer ${token}`);

  assert.equal(response.status, 401);
  assert.equal(response.body.message, 'Token has expired.');
});

test('accepts a valid JWT and attaches the authenticated user ID', async () => {
  const token = jwt.sign({ sub: userId }, jwtSecret, { expiresIn: '1h' });
  const response = await request(createProtectedApp())
    .get('/protected')
    .set('Authorization', `Bearer ${token}`);

  assert.equal(response.status, 200);
  assert.deepEqual(response.body, { userId });
});

test('provides a blacklist check hook without implementing blacklist storage', async () => {
  const token = jwt.sign({ sub: userId }, jwtSecret, { expiresIn: '1h' });
  const response = await request(express()
    .get('/protected', createAuthenticateToken({ jwtSecret, isTokenBlacklisted: async () => true }), (_request, result) => {
      result.sendStatus(204);
    }))
    .get('/protected')
    .set('Authorization', `Bearer ${token}`);

  assert.equal(response.status, 401);
  assert.equal(response.body.message, 'Token is no longer valid.');
});