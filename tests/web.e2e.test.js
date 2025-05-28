const request = require('supertest');
const createApp = require('../server');
const { database } = require('../db');

let app;

beforeAll(async () => {
  app = createApp();
  // Use an in-memory DB for isolation
  await database.connect();
});

afterEach(async () => {
  // Clean up all items after each test
  if (database.db) await database.db.remove({}, { multi: true });
});

describe('Web UI E2E', () => {
  it('GET /items should render items list', async () => {
    await database.create({ name: 'Test Item', description: 'Desc', quantity: 5 });
    const res = await request(app).get('/items');
    expect(res.status).toBe(200);
    expect(res.text).toContain('Test Item');
  });

  it('GET /items/new should render new item form', async () => {
    const res = await request(app).get('/items/new');
    expect(res.status).toBe(200);
    expect(res.text).toContain('New Item');
  });

  it('POST /items should create a new item and redirect', async () => {
    const res = await request(app)
      .post('/items')
      .send('name=WebTest&description=WebDesc&quantity=2');
    expect(res.status).toBe(302);
    const items = await database.findAll();
    expect(items.some(i => i.name === 'WebTest')).toBe(true);
  });

  it('should show validation error for missing name', async () => {
    const res = await request(app)
      .post('/items')
      .send('name=&description=NoName&quantity=1');
    expect(res.status).toBe(200);
    expect(res.text).toMatch(/required/i);
  });

  it('should delete an item via DELETE /items/:id', async () => {
    const item = await database.create({ name: 'DelMe', description: 'ToDelete', quantity: 1 });
    const res = await request(app).delete(`/items/${item._id}`);
    expect(res.status).toBe(204);
    // No body expected for 204
  });
});
