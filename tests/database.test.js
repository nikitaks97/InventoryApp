// Comprehensive tests for db/index.js to improve coverage
const path = require('path');
const fs = require('fs');
const { Database, database, initDatabase } = require('../db');

describe('Database Class', () => {
  let testDb;

  beforeEach(async () => {
    testDb = new Database();
    // Use a unique test database for each test
    await testDb.connect(`test-${Date.now()}.db`);
  });

  afterEach(async () => {
    if (testDb && testDb.isConnected) {
      await testDb.clear();
      await testDb.db.close();
    }
  });

  describe('connect', () => {
    it('should connect to database successfully', async () => {
      const newDb = new Database();
      const result = await newDb.connect(`test-connect-${Date.now()}.db`);
      expect(result).toBeDefined();
      expect(newDb.db).toBeDefined();
      expect(newDb.isConnected).toBe(true);
      await newDb.db.close();
    });

    it('should handle connection errors', async () => {
      const failingDb = new Database();
      // Try to connect to an invalid path to trigger an error
      await expect(failingDb.connect('/invalid/path/db.sqlite')).rejects.toThrow('Failed to connect to database');
    });
  });

  describe('findAll', () => {
    it('should retrieve all items', async () => {
      // Create test items using the create method
      await testDb.create({ name: 'Test Item 1', description: 'Desc 1', quantity: 5 });
      await testDb.create({ name: 'Test Item 2', description: 'Desc 2', quantity: 10 });

      const items = await testDb.findAll();
      expect(items).toHaveLength(2);
      expect(items[0]).toHaveProperty('name');
      expect(items[0]).toHaveProperty('_id');
    });

    it('should handle database errors during findAll', async () => {
      // Spy on the ensureConnected method and make it throw an error
      const ensureConnectedSpy = jest.spyOn(testDb, 'ensureConnected').mockRejectedValue(new Error('Connection failed'));
      
      await expect(testDb.findAll()).rejects.toThrow('Failed to retrieve items');
      
      ensureConnectedSpy.mockRestore();
    });
  });

  describe('findById', () => {
    let itemId;

    beforeEach(async () => {
      const item = await testDb.create({ name: 'Test Item', description: 'Desc', quantity: 5 });
      itemId = item.id || item._id;
    });

    it('should find item by ID', async () => {
      const item = await testDb.findById(itemId);
      expect(item.name).toBe('Test Item');
    });

    it('should throw error when item not found', async () => {
      await expect(testDb.findById('nonexistent')).rejects.toThrow('Item not found');
    });

    it('should handle database errors during findById', async () => {
      // Close the database to simulate an error
      await testDb.db.close();
      testDb.isConnected = false;
      
      await expect(testDb.findById(itemId)).rejects.toThrow();
    });
  });

  describe('create', () => {
    it('should create a new item successfully', async () => {
      const itemData = { name: 'New Item', description: 'New Desc', quantity: 15 };
      const result = await testDb.create(itemData);
      
      expect(result.name).toBe('New Item');
      expect(result._id).toBeDefined();
    });

    it('should validate required name field', async () => {
      const itemData = { description: 'No name', quantity: 15 };
      
      await expect(testDb.create(itemData)).rejects.toThrow('Name and description are required');
    });

    it('should validate required description field', async () => {
      const itemData = { name: 'No description', quantity: 15 };
      
      await expect(testDb.create(itemData)).rejects.toThrow('Name and description are required');
    });

    it('should validate quantity is a number', async () => {
      const itemData = { name: 'Test', description: 'Test', quantity: 'invalid' };
      
      await expect(testDb.create(itemData)).rejects.toThrow('Quantity must be a non-negative number');
    });

    it('should validate quantity is positive', async () => {
      const itemData = { name: 'Test', description: 'Test', quantity: -5 };
      
      await expect(testDb.create(itemData)).rejects.toThrow('Quantity must be a non-negative number');
    });

    it('should handle database insertion errors', async () => {
      // Mock the run method to throw an error
      const originalRun = testDb.db.run;
      testDb.db.run = jest.fn().mockRejectedValue(new Error('Database connection lost'));
      
      const itemData = { name: 'Test', description: 'Test', quantity: 5 };
      await expect(testDb.create(itemData)).rejects.toThrow('Database connection lost');
      
      // Restore original method
      testDb.db.run = originalRun;
    });
  });

  describe('update', () => {
    let itemId;

    beforeEach(async () => {
      const item = await testDb.create({ name: 'Original', description: 'Original Desc', quantity: 5 });
      itemId = item.id || item._id;
    });

    it('should update an existing item', async () => {
      const updateData = { name: 'Updated', description: 'Updated Desc', quantity: 10 };
      const result = await testDb.update(itemId, updateData);
      
      expect(result).toBeDefined();
    });

    it('should validate required name field on update', async () => {
      const updateData = { description: 'No name', quantity: 15 };
      
      await expect(testDb.update(itemId, updateData)).rejects.toThrow('Name and description are required');
    });

    it('should validate required description field on update', async () => {
      const updateData = { name: 'No description', quantity: 15 };
      
      await expect(testDb.update(itemId, updateData)).rejects.toThrow('Name and description are required');
    });

    it('should validate quantity is a number on update', async () => {
      const updateData = { name: 'Test', description: 'Test', quantity: 'invalid' };
      
      await expect(testDb.update(itemId, updateData)).rejects.toThrow('Quantity must be a non-negative number');
    });

    it('should validate quantity is positive on update', async () => {
      const updateData = { name: 'Test', description: 'Test', quantity: -5 };
      
      await expect(testDb.update(itemId, updateData)).rejects.toThrow('Quantity must be a non-negative number');
    });

    it('should handle item not found during update', async () => {
      const updateData = { name: 'Test', description: 'Test', quantity: 5 };
      
      await expect(testDb.update('nonexistent', updateData)).rejects.toThrow('Item not found');
    });

    it('should handle database update errors', async () => {
      // Close database to simulate an error
      await testDb.db.close();
      testDb.isConnected = false;
      
      const updateData = { name: 'Test', description: 'Test', quantity: 5 };
      await expect(testDb.update(itemId, updateData)).rejects.toThrow();
    });
  });

  describe('delete', () => {
    let itemId;

    beforeEach(async () => {
      const item = await testDb.create({ name: 'To Delete', description: 'Delete me', quantity: 5 });
      itemId = item.id || item._id;
    });

    it('should delete an existing item', async () => {
      const result = await testDb.delete(itemId);
      expect(result).toBe(1);
    });

    it('should handle item not found during delete', async () => {
      await expect(testDb.delete('nonexistent')).rejects.toThrow('Item not found');
    });

    it('should handle database delete errors', async () => {
      // Close database to simulate an error
      await testDb.db.close();
      testDb.isConnected = false;
      
      await expect(testDb.delete(itemId)).rejects.toThrow();
    });
  });
});

describe('initDatabase function', () => {
  it('should initialize database successfully', async () => {
    // Mock the database.connect method to avoid using the real database
    const originalConnect = database.connect;
    database.connect = jest.fn().mockResolvedValue(database);
    
    const result = await initDatabase();
    expect(result).toBe(database);
    
    // Restore original method
    database.connect = originalConnect;
  });

  it('should handle initialization errors and exit process', async () => {
    // Mock console.error and process.exit
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation();
    
    // Mock database.connect to fail
    const originalConnect = database.connect;
    database.connect = jest.fn().mockRejectedValue(new Error('Init failed'));
    
    await initDatabase();
    
    expect(consoleSpy).toHaveBeenCalledWith('Failed to initialize database:', expect.any(Error));
    expect(exitSpy).toHaveBeenCalledWith(1);
    
    // Restore mocks
    database.connect = originalConnect;
    consoleSpy.mockRestore();
    exitSpy.mockRestore();
  });
});
