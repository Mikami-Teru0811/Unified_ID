import jwt from 'jsonwebtoken';
import request from 'supertest';
import { beforeAll, describe, expect, it } from '@jest/globals';

let app;

beforeAll(async () => {
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
  const appModule = await import('../src/app.js');
  app = appModule.default;
});

const hospitalToken = jwt.sign(
  {
    id: 'hospital-user',
    _id: 'hospital-user',
    role: 'hospital',
    name: 'Test Hospital',
    username: 'hospital1'
  },
  process.env.JWT_SECRET
);

describe('NFC enrollment routes', () => {
  it('rejects GET on enroll-start with 405 instead of 404', async () => {
    const response = await request(app).get('/api/nfc/enroll-start');

    expect(response.status).toBe(405);
    expect(response.body.error).toBe('Method not allowed');
  });

  it('keeps POST /api/nfc/enroll-start registered', async () => {
    const response = await request(app)
      .post('/api/nfc/enroll-start')
      .set('Authorization', `Bearer ${hospitalToken}`)
      .send({});

    expect([200, 400, 401, 403, 500, 503]).toContain(response.status);
    expect(response.status).not.toBe(404);
  });

  it('keeps POST /api/nfc/enroll-cancel registered', async () => {
    const response = await request(app)
      .post('/api/nfc/enroll-cancel')
      .set('Authorization', `Bearer ${hospitalToken}`)
      .send({});

    expect([200, 400, 401, 403, 500, 503]).toContain(response.status);
    expect(response.status).not.toBe(404);
  });
});
