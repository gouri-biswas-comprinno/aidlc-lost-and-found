import assert from 'node:assert/strict';
import { test } from 'node:test';
import request from 'supertest';
import { createApp } from '../src/app.js';

const firstId = '507f1f77bcf86cd799439011';
const secondId = '507f1f77bcf86cd799439012';

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

test('lists reports and applies search and filters', async () => {
  const response = await request(createApp({ reportModel: createFakeModel() }))
    .get('/api/reports?search=backpack&type=lost&status=active');

  assert.equal(response.status, 200);
  assert.equal(response.body.length, 1);
  assert.equal(response.body[0].id, firstId);
});

test('rejects invalid report data before persistence', async () => {
  const response = await request(createApp({ reportModel: createFakeModel() }))
    .post('/api/reports')
    .send({ title: 'Missing fields', type: 'unknown' });

  assert.equal(response.status, 400);
  assert.equal(response.body.message, 'Report data is invalid.');
  assert.ok(response.body.errors.contactEmail);
  assert.ok(response.body.errors.type);
});

test('creates, resolves, and deletes a report', async () => {
  const app = createApp({ reportModel: createFakeModel() });
  const created = await request(app).post('/api/reports').send({
    ...sampleReport,
    _id: undefined
  });
  assert.equal(created.status, 201);

  const resolved = await request(app).patch(`/api/reports/${secondId}/resolve`);
  assert.equal(resolved.status, 200);
  assert.equal(resolved.body.status, 'resolved');

  const deleted = await request(app).delete(`/api/reports/${secondId}`);
  assert.equal(deleted.status, 204);
});

test('returns 404 for an unknown report', async () => {
  const response = await request(createApp({ reportModel: createFakeModel() }))
    .get('/api/reports/507f1f77bcf86cd799439099');

  assert.equal(response.status, 404);
});
