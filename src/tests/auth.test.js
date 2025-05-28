process.env.JWT_SECRET = process.env.JWT_SECRET || 'testsecret';

const request = require('supertest');
const app = require('../index.js');

describe('Auth API', () => {
  const user = { username: 'testuser', password: 'testpass' };

  it('should register user', async () => {
    const res = await request(app).post('/api/auth/register').send(user);
    expect(res.statusCode).toBe(201);
  });

  it('should login user and return token', async () => {
    const res = await request(app).post('/api/auth/login').send(user);
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });
});
