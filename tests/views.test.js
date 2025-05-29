// Tests for view rendering and middleware coverage
const request = require('supertest');
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const path = require('path');

// Mock the database module before requiring the routes
jest.mock('../db', () => ({
  database: {
    findAll: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  },
  initDatabase: jest.fn().mockResolvedValue(true)
}));

const { database: mockDb } = require('../db');
const itemRoutes = require('../routes/itemRoutes');

describe('View Rendering and Middleware', () => {
  let app;

  beforeEach(() => {
    app = express();
    
    // View engine setup
    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, '../views'));

    // Layout setup
    app.use(expressLayouts);
    app.set('layout', 'layout');
    app.set('layout extractScripts', true);
    app.set('layout extractStyles', true);
    
    // Middleware
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());
    
    // Mock flash and session
    app.use((req, res, next) => {
      req.flash = jest.fn().mockReturnValue([]);
      req.session = {};
      res.locals.messages = {};
      next();
    });

    app.use('/items', itemRoutes());
    
    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('View Data Population', () => {
    it('should properly populate view data for items list', async () => {
      mockDb.findAll.mockResolvedValue([
        { _id: '1', name: 'Item 1', description: 'Desc 1', quantity: 5 },
        { _id: '2', name: 'Item 2', description: 'Desc 2', quantity: 10 }
      ]);
      
      const response = await request(app).get('/items');
      expect(response.status).toBe(200);
      expect(response.text).toContain('Item 1');
      expect(response.text).toContain('Item 2');
    });

    it('should handle empty items list', async () => {
      mockDb.findAll.mockResolvedValue([]);
      
      const response = await request(app).get('/items');
      expect(response.status).toBe(200);
      expect(response.text).toContain('Item Manager'); // Should still render the page
    });

    it('should populate edit form with existing item data', async () => {
      mockDb.findById.mockResolvedValue({
        _id: '1', name: 'Edit Item', description: 'Edit Desc', quantity: 15
      });
      
      const response = await request(app).get('/items/1/edit');
      expect(response.status).toBe(200);
      expect(response.text).toContain('Edit Item');
      expect(response.text).toContain('Edit Desc');
      expect(response.text).toContain('15');
    });
  });

  describe('Flash Message Handling', () => {
    it('should display success messages', async () => {
      // Set up flash messages before app initialization
      const newApp = express();
      newApp.set('view engine', 'ejs');
      newApp.set('views', path.join(__dirname, '../views'));
      
      // Layout setup
      newApp.use(expressLayouts);
      newApp.set('layout', 'layout');
      newApp.set('layout extractScripts', true);
      newApp.set('layout extractStyles', true);
      
      newApp.use(express.urlencoded({ extended: true }));
      
      newApp.use((req, res, next) => {
        req.flash = jest.fn().mockImplementation((type) => {
          if (type === 'success') return ['Item created successfully!'];
          return [];
        });
        res.locals.messages = { success: ['Item created successfully!'] };
        next();
      });

      mockDb.findAll.mockResolvedValue([]);
      newApp.use('/items', itemRoutes());
      
      const response = await request(newApp).get('/items');
      expect(response.status).toBe(200);
      expect(response.text).toContain('Item created successfully!');
    });

    it('should display error messages', async () => {
      // Set up flash messages before app initialization
      const newApp = express();
      newApp.set('view engine', 'ejs');
      newApp.set('views', path.join(__dirname, '../views'));
      
      // Layout setup
      newApp.use(expressLayouts);
      newApp.set('layout', 'layout');
      newApp.set('layout extractScripts', true);
      newApp.set('layout extractStyles', true);
      
      newApp.use(express.urlencoded({ extended: true }));
      
      newApp.use((req, res, next) => {
        req.flash = jest.fn().mockImplementation((type) => {
          if (type === 'error') return ['Failed to create item'];
          return [];
        });
        res.locals.messages = { error: ['Failed to create item'] };
        next();
      });

      mockDb.findAll.mockResolvedValue([]);
      newApp.use('/items', itemRoutes());
      
      const response = await request(newApp).get('/items');
      expect(response.status).toBe(200);
      expect(response.text).toContain('Failed to create item');
    });
  });

  describe('Route Parameter Handling', () => {
    it('should handle valid item ID parameters', async () => {
      mockDb.findById.mockResolvedValue({
        _id: 'valid-id', name: 'Test', description: 'Test', quantity: 1
      });
      
      const response = await request(app).get('/items/valid-id/edit');
      expect(response.status).toBe(200);
      expect(mockDb.findById).toHaveBeenCalledWith('valid-id');
    });

    it('should handle special characters in item IDs', async () => {
      mockDb.findById.mockResolvedValue({
        _id: 'special-id-123', name: 'Test', description: 'Test', quantity: 1
      });
      
      const response = await request(app).get('/items/special-id-123/edit');
      expect(response.status).toBe(200);
    });
  });

  describe('Form Validation Edge Cases', () => {
    it('should handle form submission with extra fields', async () => {
      mockDb.create.mockResolvedValue({ _id: '1', name: 'Test', description: 'Test', quantity: 1 });
      
      const response = await request(app)
        .post('/items')
        .send({
          name: 'Test',
          description: 'Test',
          quantity: 1,
          extraField: 'should be ignored',
          anotherField: 'also ignored'
        });
      
      expect(response.status).toBe(302);
      expect(mockDb.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Test',
          description: 'Test',
          quantity: 1
        })
      );
    });

    it('should trim whitespace from form inputs', async () => {
      mockDb.create.mockResolvedValue({ _id: '1', name: 'Test', description: 'Test', quantity: 1 });
      
      const response = await request(app)
        .post('/items')
        .send({
          name: '  Test  ',
          description: '  Test Description  ',
          quantity: 1
        });
      
      expect(response.status).toBe(302);
      expect(mockDb.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Test',
          description: 'Test Description'
        })
      );
    });
  });
});
