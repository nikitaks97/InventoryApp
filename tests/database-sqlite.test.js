// Comprehensive tests for SQLite database implementation
const path = require('path');
const fs = require('fs');
const { Database, database, initDatabase } = require('../db');

describe('SQLite Database Class', () => {
  let testDb;
  let testDbPath;

  beforeEach(async () => {
    // Create a unique test database for each test
    const testId = Date.now() + Math.random();
    testDbPath = path.join(__dirname, `../data/test-${testId}.db`);
    
    // Ensure data directory exists
    const dataDir = path.join(__dirname, '../data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    testDb = new Database();
    await testDb.connect(`test-${testId}.db`);
  });

  afterEach(async () => {
    if (testDb && testDb.db) {
      try {
        await testDb.clear();
        await testDb.close();
      } catch (error) {
        // Ignore errors during cleanup
      }
    }
    
    // Clean up test database file
    if (testDbPath && fs.existsSync(testDbPath)) {
      try {
        fs.unlinkSync(testDbPath);
      } catch (error) {
        // Ignore errors during cleanup
      }
    }
  });

  describe('connect', () => {
    it('should connect to database successfully', async () => {
      const newDb = new Database();
      await newDb.connect('test-connect.db');
      expect(newDb.isConnected).toBe(true);
      expect(newDb.db).toBeDefined();
      await newDb.close();
    });

    it.skip('should handle connection errors', async () => {
      // Skip this test as SQLite is very permissive with file paths
      // In a real scenario, this would test database permission failures
    });
  });

  describe('findAll', () => {
    it('should retrieve all items', async () => {
      // Insert test data
      await testDb.create({ name: 'Test Item 1', description: 'Desc 1', quantity: 5 });
      await testDb.create({ name: 'Test Item 2', description: 'Desc 2', quantity: 10 });

      const items = await testDb.findAll();
      expect(items).toHaveLength(2);
      expect(items[0]).toHaveProperty('_id');
      expect(items[0]).toHaveProperty('name');
    });

    it('should return empty array when no items exist', async () => {
      const items = await testDb.findAll();
      expect(items).toHaveLength(0);
    });

    it('should handle database errors during findAll', async () => {
      // Close the database to cause an error
      await testDb.close();
      testDb.isConnected = false;
      
      // Mock the database connection to fail
      testDb.connect = jest.fn().mockRejectedValue(new Error('Database error'));
      
      await expect(testDb.findAll()).rejects.toThrow('Failed to retrieve items');
    });
  });

  describe('findById', () => {
    let itemId;

    beforeEach(async () => {
      const item = await testDb.create({ name: 'Test Item', description: 'Desc', quantity: 5 });
      itemId = item._id;
    });

    it('should find item by ID', async () => {
      const item = await testDb.findById(itemId);
      expect(item.name).toBe('Test Item');
      expect(item._id).toBe(itemId);
    });

    it('should throw error when item not found', async () => {
      await expect(testDb.findById('99999')).rejects.toThrow('Item not found');
    });

    it('should handle database errors during findById', async () => {
      // Close the database to cause an error
      await testDb.close();
      testDb.isConnected = false;
      testDb.connect = jest.fn().mockRejectedValue(new Error('Database error'));
      
      await expect(testDb.findById(itemId)).rejects.toThrow('Database error');
    });
  });

  describe('create', () => {
    it('should create a new item successfully', async () => {
      const itemData = { name: 'New Item', description: 'New Description', quantity: 5 };
      const item = await testDb.create(itemData);
      
      expect(item).toHaveProperty('_id');
      expect(item.name).toBe(itemData.name);
      expect(item.description).toBe(itemData.description);
      expect(item.quantity).toBe(itemData.quantity);
    });

    it('should validate required name field', async () => {
      const itemData = { description: 'Description', quantity: 5 };
      await expect(testDb.create(itemData)).rejects.toThrow('Name and description are required');
    });

    it('should validate required description field', async () => {
      const itemData = { name: 'Name', quantity: 5 };
      await expect(testDb.create(itemData)).rejects.toThrow('Name and description are required');
    });

    it('should validate quantity is a number', async () => {
      const itemData = { name: 'Name', description: 'Description', quantity: 'invalid' };
      await expect(testDb.create(itemData)).rejects.toThrow('Quantity must be a non-negative number');
    });

    it('should validate quantity is non-negative', async () => {
      const itemData = { name: 'Name', description: 'Description', quantity: -1 };
      await expect(testDb.create(itemData)).rejects.toThrow('Quantity must be a non-negative number');
    });

    it('should handle unique constraint violation', async () => {
      const itemData = { name: 'Duplicate', description: 'Description', quantity: 5 };
      await testDb.create(itemData);
      
      await expect(testDb.create(itemData)).rejects.toThrow('An item with this name already exists');
    });
  });

  describe('update', () => {
    let itemId;

    beforeEach(async () => {
      const item = await testDb.create({ name: 'Original', description: 'Original Desc', quantity: 5 });
      itemId = item._id;
    });

    it('should update an existing item', async () => {
      const updateData = { name: 'Updated', description: 'Updated Desc', quantity: 10 };
      const updatedItem = await testDb.update(itemId, updateData);
      
      expect(updatedItem.name).toBe(updateData.name);
      expect(updatedItem.description).toBe(updateData.description);
      expect(updatedItem.quantity).toBe(updateData.quantity);
    });

    it('should validate required name field on update', async () => {
      const updateData = { description: 'Updated Desc', quantity: 10 };
      await expect(testDb.update(itemId, updateData)).rejects.toThrow('Name and description are required');
    });

    it('should validate required description field on update', async () => {
      const updateData = { name: 'Updated', quantity: 10 };
      await expect(testDb.update(itemId, updateData)).rejects.toThrow('Name and description are required');
    });

    it('should validate quantity is a number on update', async () => {
      const updateData = { name: 'Updated', description: 'Updated Desc', quantity: 'invalid' };
      await expect(testDb.update(itemId, updateData)).rejects.toThrow('Quantity must be a non-negative number');
    });

    it('should validate quantity is non-negative on update', async () => {
      const updateData = { name: 'Updated', description: 'Updated Desc', quantity: -1 };
      await expect(testDb.update(itemId, updateData)).rejects.toThrow('Quantity must be a non-negative number');
    });

    it('should handle item not found during update', async () => {
      const updateData = { name: 'Test', description: 'Test', quantity: 5 };
      await expect(testDb.update('99999', updateData)).rejects.toThrow('Item not found');
    });

    it('should handle unique constraint violation on update', async () => {
      // Create another item with a unique name
      await testDb.create({ name: 'Another Item', description: 'Another Desc', quantity: 3 });
      
      // Try to update the first item to have the same name
      const updateData = { name: 'Another Item', description: 'Updated Desc', quantity: 10 };
      await expect(testDb.update(itemId, updateData)).rejects.toThrow('An item with this name already exists');
    });
  });

  describe('delete', () => {
    let itemId;

    beforeEach(async () => {
      const item = await testDb.create({ name: 'To Delete', description: 'Will be deleted', quantity: 5 });
      itemId = item._id;
    });

    it('should delete an existing item', async () => {
      const numRemoved = await testDb.delete(itemId);
      expect(numRemoved).toBe(1);
      
      // Verify item is deleted
      await expect(testDb.findById(itemId)).rejects.toThrow('Item not found');
    });

    it('should handle item not found during delete', async () => {
      await expect(testDb.delete('99999')).rejects.toThrow('Item not found');
    });

    it('should handle database delete errors', async () => {
      // Close the database to cause an error
      await testDb.close();
      testDb.isConnected = false;
      testDb.connect = jest.fn().mockRejectedValue(new Error('Database error'));
      
      await expect(testDb.delete(itemId)).rejects.toThrow('Database error');
    });
  });

  describe('clear', () => {
    it('should clear all items from database', async () => {
      // Add some items
      await testDb.create({ name: 'Item 1', description: 'Desc 1', quantity: 5 });
      await testDb.create({ name: 'Item 2', description: 'Desc 2', quantity: 10 });
      
      // Clear database
      await testDb.clear();
      
      // Verify all items are removed
      const items = await testDb.findAll();
      expect(items).toHaveLength(0);
    });
  });
});

describe('initDatabase function', () => {
  it('should initialize database successfully', async () => {
    // Mock the database connect method
    const originalConnect = database.connect;
    database.connect = jest.fn().mockResolvedValue({ test: 'db' });
    
    const result = await initDatabase();
    expect(result).toBe(database);
    
    // Restore original method
    database.connect = originalConnect;
  });

  it('should handle initialization errors and exit process', async () => {
    const originalConnect = database.connect;
    const originalExit = process.exit;
    const originalConsoleError = console.error;
    
    // Mock process.exit and console.error
    process.exit = jest.fn();
    console.error = jest.fn();
    database.connect = jest.fn().mockRejectedValue(new Error('Init failed'));
    
    await initDatabase();
    
    expect(console.error).toHaveBeenCalledWith('Failed to initialize database:', expect.any(Error));
    expect(process.exit).toHaveBeenCalledWith(1);
    
    // Restore original methods
    database.connect = originalConnect;
    process.exit = originalExit;
    console.error = originalConsoleError;
  });
});
