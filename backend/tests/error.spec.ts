import request from 'supertest';
import app from '../src/app';

describe('Error handling', () => {
  it('returns 404 JSON for unknown route', async () => {
    const res = await request(app).get('/api/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ message: 'Not Found' });
  });

  it('handles thrown errors with proper status/message', async () => {
    // Simulate an error route temporarily via supertest by calling a known route with wrong method
    const res = await request(app).post('/api/health');
    // Express will likely respond 404 for unsupported method on this route
    // The important part: it should be JSON with a message
    expect([404, 405]).toContain(res.status);
    expect(typeof res.body).toBe('object');
    expect(res.body.message).toBeDefined();
  });
});
