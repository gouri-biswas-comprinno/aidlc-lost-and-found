import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import { test } from 'node:test';
import request from 'supertest';
import { createApp } from '../src/app.js';

const firstId = '507f1f77bcf86cd799439011';
const secondId = '507f1f77bcf86cd799439012';
const jwtOptions = { jwtSecret: 'report-test-secret' };
const validToken = jwt.sign({ sub: '507f1f77bcf86cd799439099' }, jwtOptions.jwtSecret, { expiresIn: '1h' });

const sampleReport = {
  _id: firstId,
  title: 'Blue backpack',
  description: 'Small blue backpack with a library tag.',
  type: 'lost',
  category: 'Bags',
  location: 'Central library',
  date: '2026-09-01',
  contactName: 'Alex Example',
  contactEmail: 'alex@example.com',
  status: 'active',
  createdAt: '2026-09-01T12:00:00.000Z'
};

function createFakeModel() {
  const reports = new Map([[firstId, { ...sampleReport }]]);
  return {
    find(filter) {
      const matches = [...reports.values()].filter((report) => {
        if (filter.type && report.type !== filter.type) return false;
        if (filter.category && report.category !== filter.category) return false;
        if (filter.status && report.status !== filter.status) return false;
        if (filter.$or) {
          const searchable = `${report.title} ${report.description} ${report.location} ${report.category}`.toLowerCase();
          const term = filter.$or[0].title.$regex.toLowerCase();
          if (!searchable.includes(term)) return false;
        }
        return true;
      });
      return {
        sort: () => ({ lean: async () => matches })
      };
    },
    findById(id) {
      return { lean: async () => reports.get(id) || null };
    },
    create(value) {
      const report = { ...value, _id: secondId, createdAt: new Date().toISOString() };
      reports.set(secondId, report);
      return Promise.resolve(report);
    },
    findByIdAndUpdate(id, update) {
      const report = reports.get(id);
      if (!report) return { lean: async () => null };
      Object.assign(report, update);
      return { lean: async () => report };
    },
    findByIdAndDelete(id) {
      const report = reports.get(id) || null;
      reports.delete(id);
      return Promise.resolve(report);
    }
  };
}

function createFakeBlacklistModel() {
  return {
    findOne({ token }) {
      return { lean: async () => (token === 'blacklisted-token' ? { token, expiresAt: new Date(Date.now() + 60_000) } : null) };
    }
  };
}

function createReportApp(reportModel = createFakeModel()) {
  return createApp({
    reportModel,
    blacklistModel: createFakeBlacklistModel(),
    jwtOptions
  });
}

test('lists reports and applies search and filters', async () => {
  const response = await request(createReportApp())
    .get('/api/reports?search=backpack&type=lost&status=active');

  assert.equal(response.status, 200);
  assert.equal(response.body.length, 1);
  assert.equal(response.body[0].id, firstId);
});

test('rejects invalid report data before persistence', async () => {
  const response = await request(createReportApp())
    .post('/api/reports')
    .set('Authorization', `Bearer ${validToken}`)
    .send({ title: 'Missing fields', type: 'unknown' });

  assert.equal(response.status, 400);
  assert.equal(response.body.message, 'Report data is invalid.');
  assert.ok(response.body.errors.contactEmail);
  assert.ok(response.body.errors.type);
});

test('creates, resolves, and deletes a report', async () => {
  const app = createReportApp();
  const created = await request(app).post('/api/reports').set('Authorization', `Bearer ${validToken}`).send({
    ...sampleReport,
    _id: undefined
  });
  assert.equal(created.status, 201);

  const updated = await request(app).put(`/api/reports/${secondId}`)
    .set('Authorization', `Bearer ${validToken}`)
    .send({ ...sampleReport, title: 'Updated backpack', _id: undefined });
  assert.equal(updated.status, 200);
  assert.equal(updated.body.title, 'Updated backpack');

  const resolved = await request(app).patch(`/api/reports/${secondId}/resolve`).set('Authorization', `Bearer ${validToken}`);
  assert.equal(resolved.status, 200);
  assert.equal(resolved.body.status, 'resolved');

  const deleted = await request(app).delete(`/api/reports/${secondId}`).set('Authorization', `Bearer ${validToken}`);
  assert.equal(deleted.status, 204);
});

test('returns 404 for an unknown report', async () => {
  const response = await request(createReportApp())
    .get('/api/reports/507f1f77bcf86cd799439099');

  assert.equal(response.status, 404);
});

test('keeps report list and details public', async () => {
  const app = createReportApp();
  const listResponse = await request(app).get('/api/reports');
  const detailsResponse = await request(app).get(`/api/reports/${firstId}`);

  assert.equal(listResponse.status, 200);
  assert.equal(detailsResponse.status, 200);
});

test('rejects protected report writes without a valid token', async () => {
  const app = createReportApp();
  const report = { ...sampleReport, _id: undefined };
  const missing = await request(app).post('/api/reports').send(report);
  const malformed = await request(app).post('/api/reports').set('Authorization', 'Basic token').send(report);
  const invalid = await request(app).post('/api/reports').set('Authorization', 'Bearer invalid').send(report);
  const expiredToken = jwt.sign({ sub: 'expired-user' }, jwtOptions.jwtSecret, { expiresIn: -1 });
  const expired = await request(app).post('/api/reports').set('Authorization', `Bearer ${expiredToken}`).send(report);
  const blacklisted = await request(app).post('/api/reports').set('Authorization', 'Bearer blacklisted-token').send(report);

  assert.equal(missing.status, 401);
  assert.equal(malformed.status, 401);
  assert.equal(invalid.status, 401);
  assert.equal(expired.status, 401);
  assert.equal(blacklisted.status, 401);
});

test('allows a valid token to reach the existing report controller', async () => {
  const response = await request(createReportApp()).post('/api/reports')
    .set('Authorization', `Bearer ${validToken}`)
    .send({ ...sampleReport, _id: undefined });

  assert.equal(response.status, 201);
  assert.equal(response.body.title, sampleReport.title);
});
