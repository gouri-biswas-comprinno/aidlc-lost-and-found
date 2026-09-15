import assert from 'node:assert/strict';
import { test } from 'node:test';
import { BlacklistedToken } from '../src/models/blacklistedToken.js';

test('blacklist model stores token expiration with a TTL index', () => {
  const tokenPath = BlacklistedToken.schema.path('token');
  const expiresAtPath = BlacklistedToken.schema.path('expiresAt');
  const ttlIndex = BlacklistedToken.schema.indexes().find(([fields]) => fields.expiresAt === 1);

  assert.equal(tokenPath.options.required, true);
  assert.equal(expiresAtPath.options.required, true);
  assert.ok(ttlIndex);
  assert.equal(ttlIndex[1].expireAfterSeconds, 0);
  assert.equal(BlacklistedToken.collection.name, 'blacklisted_tokens');
});