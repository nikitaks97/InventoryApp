// Tests for routes/itemRoutes.js functionality to increase coverage
const request = require('supertest');
const express = require('express');
const path = require('path');

// Mock the database
const mockDb = {
  findAll: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  delete: jest.fn()
};

jest.mock('../db', () => ({
  database: mockDb,
  __esModule: true
}));

const itemRoutes = require('../routes/itemRoutes');

describe('Item Routes Detailed Coverage', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, '../views'));
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());
    
    // Mock flash function
    app.use((req, res, next) => {
      req.flash = jest.fn().mockReturnValue([]);
      res.locals.messages = {};
      next();
    });
    
    app.locals.db = mockDb;
    app.use('/items', itemRoutes());
    
    // Error handler
    app.use((err, req, res, next) => {
      res.status(err.status || 500).json({ error: err.message });
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /items validation edge cases', () => {
    it('should handle empty string name', async () => {
      const response = await request(app)
        .post('/items')
        .send({ name: '', description: 'Test', quantity: 1 });
      
      expect(response.status).toBe(302); // Redirect with flash error
    });

    it('should handle empty string description', async () => {
      const response = await request(app)
        .post('/items')
        .send({ name: 'Test', description: '', quantity: 1 });
      
      expect(response.status).toBe(302); // Redirect with flash error
    });

    it('should handle zero quantity', async () => {
      const response = await request(app)
        .post('/items')
        .send({ name: 'Test', description: 'Test', quantity: 0 });
      
      expect(response.status).toBe(302); // Should accept 0 as valid
    });

    it('should handle string quantity that can be converted to number', async () => {
      mockDb.create.mockResolvedValueOnce({ _id: '1', name: 'Test', description: 'Test', quantity: 5 });
      
      const response = await request(app)
        .post('/items')
        .send({ name: 'Test', description: 'Test', quantity: '5' });
      
      expect(response.status).toBe(302);
      expect(mockDb.create).toHaveBeenCalledWith(
        expect.objectContaining({ quantity: 5 })
      );
    });

    it('should handle non-numeric quantity string', async () => {
      const response = await request(app)
        .post('/items')
        .send({ name: 'Test', description: 'Test', quantity: 'abc' });
      
      expect(response.status).toBe(302); // Redirect with flash error
    });
  });

  describe('GET /items error handling', () => {
    it('should handle database connection issues', async () => {
      mockDb.findAll.mockRejectedValueOnce(new Error('Database connection failed'));
      
      const response = await request(app).get('/items');
      expect(response.status).toBe(500);
    });
  });

  describe('GET /items/:id/edit error scenarios', () => {
    it('should handle malformed item ID', async () => {
      mockDb.findById.mockRejectedValueOnce(new Error('Invalid ID format'));
      
      const response = await request(app).get('/items/invalid-id/edit');
      expect(response.status).toBe(500);
    });
  });

  describe('POST /items/:id update scenarios', () => {
    it('should handle partial updates', async () => {
      mockDb.findById.mockResolvedValueOnce({
        _id: '1', name: 'Original', description: 'Original Desc', quantity: 5
      });
      mockDb.update.mockResolvedValueOnce(true);
      
      const response = await request(app)
        .post('/items/1')
        .send({ name: 'Updated Name' }); // Only updating name
      
      expect(response.status).toBe(302);
    });

    it('should preserve original values for missing fields', async () => {
      const originalItem = {
        _id: '1', name: 'Original', description: 'Original Desc', quantity: 5
      };
      mockDb.findById.mockResolvedValueOnce(originalItem);
      mockDb.update.mockResolvedValueOnce(true);
      
      const response = await request(app)
        .post('/items/1')
        .send({ quantity: '10' }); // Only updating quantity
      
      expect(response.status).toBe(302);
      expect(mockDb.update).toHaveBeenCalledWith('1', 
        expect.objectContaining({
          name: 'Original',
          description: 'Original Desc',
          quantity: 10
        })
      );
    });
  });

  describe('DELETE /items/:id edge cases', () => {
    it('should handle database deletion errors', async () => {
      mockDb.delete.mockRejectedValueOnce(new Error('Deletion failed'));
      
      const response = await request(app).delete('/items/1');
      expect(response.status).toBe(500);
    });

    it('should handle successful deletion with proper response', async () => {
      mockDb.delete.mockResolvedValueOnce(1);
      
      const response = await request(app).delete('/items/1');
      expect(response.status).toBe(204);
      expect(response.body).toEqual({});
    });
  });

  describe('Content-Type handling', () => {
    it('should handle form-encoded POST requests', async () => {
      mockDb.create.mockResolvedValueOnce({ _id: '1', name: 'Test', description: 'Test', quantity: 1 });
      
      const response = await request(app)
        .post('/items')
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .send('name=Test&description=Test&quantity=1');
      
      expect(response.status).toBe(302);
      expect(mockDb.create).toHaveBeenCalled();
    });

    it('should handle JSON POST requests', async () => {
      mockDb.create.mockResolvedValueOnce({ _id: '1', name: 'Test', description: 'Test', quantity: 1 });
      
      const response = await request(app)
        .post('/items')
        .set('Content-Type', 'application/json')
        .send({ name: 'Test', description: 'Test', quantity: 1 });
      
      expect(response.status).toBe(302);
      expect(mockDb.create).toHaveBeenCalled();
    });
  });
});
