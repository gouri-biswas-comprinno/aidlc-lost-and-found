import assert from 'node:assert/strict';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { test } from 'node:test';
import request from 'supertest';
import { createApp } from '../src/app.js';

const firstId = '507f1f77bcf86cd799439021';
const jwtOptions = { jwtSecret: 'unit-test-secret', jwtExpiresIn: '1h' };

function createFakeUserModel() {
  const users = [];

  return {
    users,
    findOne({ email }) {
      return { lean: async () => users.find((user) => user.email === email) || null };
    },
    create(value) {
      const user = { ...value, _id: firstId, createdAt: new Date(), updatedAt: new Date() };
      users.push(user);
      return Promise.resolve(user);
    }
  };
}

function createFakeBlacklistModel() {
  const records = [];

  return {
    records,
    findOne({ token }) {
      return { lean: async () => records.find((record) => record.token === token) || null };
    },
    create(value) {
      if (records.some((record) => record.token === value.token)) {
        const error = new Error('Duplicate token.');
        error.code = 11000;
        return Promise.reject(error);
      }
      records.push(value);
      return Promise.resolve(value);
    }
  };
}

test('signs up a user with a hashed password and safe response data', async () => {
  const userModel = createFakeUserModel();
  const response = await request(createApp({ userModel }))
    .post('/api/auth/signup')
    .send({ name: 'Alex Example', email: ' Alex@Example.com ', password: 'secure-pass' });

  assert.equal(response.status, 201);
  assert.equal(response.body.id, firstId);
  assert.equal(response.body.email, 'alex@example.com');
  assert.equal(response.body.passwordHash, undefined);
  assert.equal(userModel.users.length, 1);
  assert.notEqual(userModel.users[0].passwordHash, 'secure-pass');
  assert.equal(await bcrypt.compare('secure-pass', userModel.users[0].passwordHash), true);
});

test('rejects a duplicate normalized email', async () => {
  const userModel = createFakeUserModel();
  await request(createApp({ userModel }))
    .post('/api/auth/signup')
    .send({ name: 'First User', email: 'user@example.com', password: 'secure-pass' });

  const response = await request(createApp({ userModel }))
    .post('/api/auth/signup')
    .send({ name: 'Second User', email: ' USER@example.com ', password: 'another-pass' });

  assert.equal(response.status, 409);
  assert.equal(response.body.message, 'Email is already registered.');
  assert.equal(userModel.users.length, 1);
});

test('rejects invalid signup input before persistence', async () => {
  const userModel = createFakeUserModel();
  const response = await request(createApp({ userModel }))
    .post('/api/auth/signup')
    .send({ name: ' ', email: 'not-an-email', password: 'short' });

  assert.equal(response.status, 400);
  assert.equal(response.body.message, 'Signup data is invalid.');
  assert.ok(response.body.errors.name);
  assert.ok(response.body.errors.email);
  assert.ok(response.body.errors.password);
  assert.equal(userModel.users.length, 0);
});

test('logs in with normalized email and returns a finite JWT without passwordHash', async () => {
  const userModel = createFakeUserModel();
  const app = createApp({ userModel, jwtOptions });
  await request(app)
    .post('/api/auth/signup')
    .send({ name: 'Alex Example', email: 'user@example.com', password: 'secure-pass' });

  const response = await request(app)
    .post('/api/auth/login')
    .send({ email: ' USER@example.com ', password: 'secure-pass' });

  assert.equal(response.status, 200);
  assert.equal(response.body.user.id, firstId);
  assert.equal(response.body.user.passwordHash, undefined);
  const claims = jwt.verify(response.body.token, jwtOptions.jwtSecret);
  assert.equal(claims.sub, firstId);
  assert.equal(typeof claims.exp, 'number');
  assert.ok(claims.exp > claims.iat);
  assert.equal(Object.keys(claims).sort().join(','), 'exp,iat,sub');
});

test('rejects a wrong password and unknown email with 401', async () => {
  const userModel = createFakeUserModel();
  const app = createApp({ userModel, jwtOptions });
  await request(app)
    .post('/api/auth/signup')
    .send({ name: 'Alex Example', email: 'user@example.com', password: 'secure-pass' });

  const wrongPassword = await request(app)
    .post('/api/auth/login')
    .send({ email: 'user@example.com', password: 'wrong-pass' });
  const unknownEmail = await request(app)
    .post('/api/auth/login')
    .send({ email: 'unknown@example.com', password: 'secure-pass' });

  assert.equal(wrongPassword.status, 401);
  assert.equal(unknownEmail.status, 401);
  assert.equal(wrongPassword.body.token, undefined);
  assert.equal(unknownEmail.body.token, undefined);
});

test('rejects malformed login input before lookup', async () => {
  const userModel = createFakeUserModel();
  const response = await request(createApp({ userModel, jwtOptions }))
    .post('/api/auth/login')
    .send({ email: 'not-an-email' });

  assert.equal(response.status, 400);
  assert.equal(response.body.message, 'Login data is invalid.');
  assert.ok(response.body.errors.email);
  assert.ok(response.body.errors.password);
});

test('logs out an authenticated token without returning the token', async () => {
  const userModel = createFakeUserModel();
  const blacklistModel = createFakeBlacklistModel();
  const app = createApp({ userModel, blacklistModel, jwtOptions });
  const login = await request(app)
    .post('/api/auth/signup')
    .send({ name: 'Alex Example', email: 'user@example.com', password: 'secure-pass' });
  assert.equal(login.status, 201);

  const token = jwt.sign({ sub: firstId }, jwtOptions.jwtSecret, { expiresIn: '1h' });
  const response = await request(app)
    .post('/api/auth/logout')
    .set('Authorization', `Bearer ${token}`);

  assert.equal(response.status, 200);
  assert.equal(response.body.message, 'Logout successful.');
  assert.equal(response.body.token, undefined);
  assert.equal(blacklistModel.records.length, 1);
  assert.equal(blacklistModel.records[0].token, token);
  assert.ok(blacklistModel.records[0].expiresAt instanceof Date);
});

test('rejects a blacklisted token while accepting a valid non-blacklisted token', async () => {
  const blacklistModel = createFakeBlacklistModel();
  const app = createApp({ blacklistModel, jwtOptions });
  const loggedOutToken = jwt.sign({ sub: firstId }, jwtOptions.jwtSecret, { expiresIn: '1h' });
  await blacklistModel.create({ token: loggedOutToken, expiresAt: new Date(Date.now() + 60_000) });

  const rejected = await request(app)
    .post('/api/auth/logout')
    .set('Authorization', `Bearer ${loggedOutToken}`);
  assert.equal(rejected.status, 401);
  assert.equal(rejected.body.message, 'Token is no longer valid.');

  const validToken = jwt.sign({ sub: firstId + '2' }, jwtOptions.jwtSecret, { expiresIn: '1h' });
  const accepted = await request(app)
    .post('/api/auth/logout')
    .set('Authorization', `Bearer ${validToken}`);
  assert.equal(accepted.status, 200);
});

test('does not reject a token for an expired blacklist record', async () => {
  const blacklistModel = createFakeBlacklistModel();
  const app = createApp({ blacklistModel, jwtOptions });
  const token = jwt.sign({ sub: firstId }, jwtOptions.jwtSecret, { expiresIn: '1h' });
  await blacklistModel.create({ token, expiresAt: new Date(Date.now() - 60_000) });

  const response = await request(app)
    .post('/api/auth/logout')
    .set('Authorization', `Bearer ${token}`);

  assert.equal(response.status, 200);
  assert.equal(response.body.message, 'Logout successful.');
});