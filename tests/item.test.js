process.env.JWT_SECRET = process.env.JWT_SECRET || 'testsecret';

const request = require('supertest');
const express = require('express');
const path = require('path');

// Mock the database for testing
const mockDatabase = {
  findAll: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn() // Ensure delete is part of the mock
};

jest.mock('../db', () => ({
  database: mockDatabase,
  __esModule: true, // if your db/index.js uses ES modules, keep this
  default: mockDatabase // if db/index.js uses `export default`
}));

const { database } = require('../db');

describe('Item Routes', () => {
  let app;

  beforeEach(() => {
    // Create a fresh app instance for each test
    app = express();
    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, '../views'));
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());

    // Reset all mocks
    jest.clearAllMocks();

    // Setup routes
    const itemRoutes = require('../routes/itemRoutes');
    app.use('/items', itemRoutes());
  });

  describe('GET /items', () => {
    it('should render items list', async () => {
      const mockItems = [
        { _id: '1', name: 'Item 1', description: 'Description 1', quantity: 1 },
        { _id: '2', name: 'Item 2', description: 'Description 2', quantity: 2 }
      ];

      mockDatabase.findAll.mockResolvedValue(mockItems);

      // Mock res.render to simulate successful rendering
      const renderSpy = jest.spyOn(app.response, 'render').mockImplementation(function(view, options) {
        this.status(200).send('<html>Mock Rendered</html>');
      });

      const response = await request(app).get('/items');
      expect(response.status).toBe(200);
      expect(database.findAll).toHaveBeenCalled();

      renderSpy.mockRestore();
    });
  });

  describe('POST /items', () => {
    it('should create a new item', async () => {
      const newItem = {
        name: 'New Item',
        description: 'New Description',
        quantity: 1
      };

      mockDatabase.create.mockResolvedValue({ ...newItem, _id: '3' });

      const response = await request(app)
        .post('/items')
        .send(newItem)
        .expect(302); // Redirect after creation

      expect(mockDatabase.create).toHaveBeenCalledWith(expect.objectContaining({
        name: newItem.name,
        description: newItem.description,
        quantity: newItem.quantity
      }));
    });

    it('should handle validation errors', async () => {
      const invalidItem = {
        name: '', // Empty name should fail validation
        description: 'Description',
        quantity: 1
      };

      mockDatabase.create.mockRejectedValue(new Error('Name is required'));

      const response = await request(app)
        .post('/items')
        .send(invalidItem)
        .expect(200); // Renders the form again with errors
    });
  });

  describe('DELETE /items/:id', () => {
    it('should delete an item and return 204 status', async () => {
      mockDatabase.delete.mockResolvedValue(1); // Use mockDatabase here
      const response = await request(app).delete('/items/1');
      expect(response.statusCode).toBe(204);
    });

    it('should return 404 if item to delete is not found', async () => {
      mockDatabase.delete.mockResolvedValue(0); // Use mockDatabase here
      const response = await request(app).delete('/items/999');
      expect(response.statusCode).toBe(404);
    });

    it('should return 500 if database deletion fails', async () => {
      mockDatabase.delete.mockRejectedValue(new Error('Deletion failed')); // Use mockDatabase here
      const response = await request(app).delete('/items/1');
      expect(response.statusCode).toBe(500);
    });
  });
});
