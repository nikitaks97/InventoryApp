process.env.JWT_SECRET = process.env.JWT_SECRET || 'testsecret';

const request = require('supertest');
const app = require('../index.js');

let token = '';

beforeAll(async () => {
  await request(app).post('/api/auth/register').send({ username: 'taskuser', password: '123456' });
  const res = await request(app).post('/api/auth/login').send({ username: 'taskuser', password: '123456' });
  token = res.body.token;
});

describe('Tasks API', () => {
  it('should create a task', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Test Task' });
    expect(res.statusCode).toBe(201);
  });

  it('should get all tasks', async () => {
    const res = await request(app)
      .get('/api/tasks')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
