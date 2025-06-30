const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

class Database {
    constructor() {
        this.db = null;
        this.isConnected = false;
    }

    async connect(filename = 'items.db') {
        try {
            // Ensure data directory exists
            const fs = require('fs');
            const dataDir = path.join(__dirname, '../data');
            if (!fs.existsSync(dataDir)) {
                fs.mkdirSync(dataDir, { recursive: true });
            }

            const dbPath = path.join(dataDir, filename);
            
            this.db = await open({
                filename: dbPath,
                driver: sqlite3.Database
            });

            // Create table if it doesn't exist
            await this.db.exec(`
                CREATE TABLE IF NOT EXISTS items (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT UNIQUE NOT NULL,
                    description TEXT NOT NULL,
                    quantity INTEGER NOT NULL DEFAULT 0,
                    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `);

            // Create index on name for better performance
            await this.db.exec(`
                CREATE INDEX IF NOT EXISTS idx_items_name ON items(name)
            `);

            this.isConnected = true;
            console.log('📦 Database connected successfully');
            return this.db;
        } catch (error) {
            console.error('Database connection error:', error);
            throw new Error('Failed to connect to database');
        }
    }

    async ensureConnected() {
        if (!this.isConnected || !this.db) {
            await this.connect();
        }
        // Check if database connection is still valid
        try {
            await this.db.get('SELECT 1');
        } catch (error) {
            throw new Error('Database connection is not available');
        }
    }

    async findAll() {
        try {
            await this.ensureConnected();
            const items = await this.db.all('SELECT * FROM items ORDER BY createdAt DESC');
            return items.map(item => ({
                ...item,
                _id: item.id.toString() // Maintain compatibility with existing code
            }));
        } catch (error) {
            console.error('Error finding items:', error);
            throw new Error('Failed to retrieve items');
        }
    }

    async findById(id) {
        try {
            await this.ensureConnected();
            const item = await this.db.get('SELECT * FROM items WHERE id = ?', [id]);
            if (!item) {
                throw new Error('Item not found');
            }
            return {
                ...item,
                _id: item.id.toString() // Maintain compatibility
            };
        } catch (error) {
            console.error(`Error finding item ${id}:`, error);
            throw error;
        }
    }

    async create(itemData) {
        try {
            await this.ensureConnected();
            
            // Validate required fields
            if (!itemData.name || !itemData.description) {
                throw new Error('Name and description are required');
            }

            // Validate quantity
            if (typeof itemData.quantity !== 'number' || itemData.quantity < 0) {
                throw new Error('Quantity must be a non-negative number');
            }

            const result = await this.db.run(
                'INSERT INTO items (name, description, quantity) VALUES (?, ?, ?)',
                [itemData.name, itemData.description, itemData.quantity]
            );

            // Return the created item
            const createdItem = await this.findById(result.lastID);
            return createdItem;
        } catch (error) {
            console.error('Error creating item:', error);
            if (error.message.includes('UNIQUE constraint failed')) {
                throw new Error('An item with this name already exists');
            }
            throw error;
        }
    }

    async update(id, itemData) {
        try {
            await this.ensureConnected();

            // Validate required fields
            if (!itemData.name || !itemData.description) {
                throw new Error('Name and description are required');
            }

            // Validate quantity
            if (typeof itemData.quantity !== 'number' || itemData.quantity < 0) {
                throw new Error('Quantity must be a non-negative number');
            }

            const result = await this.db.run(
                'UPDATE items SET name = ?, description = ?, quantity = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
                [itemData.name, itemData.description, itemData.quantity, id]
            );

            if (result.changes === 0) {
                throw new Error('Item not found');
            }

            // Return the updated item
            const updatedItem = await this.findById(id);
            return updatedItem;
        } catch (error) {
            console.error(`Error updating item ${id}:`, error);
            if (error.message.includes('UNIQUE constraint failed')) {
                throw new Error('An item with this name already exists');
            }
            throw error;
        }
    }

    async delete(id) {
        try {
            await this.ensureConnected();
            const result = await this.db.run('DELETE FROM items WHERE id = ?', [id]);
            
            if (result.changes === 0) {
                throw new Error('Item not found');
            }
            
            return result.changes;
        } catch (error) {
            console.error(`Error deleting item ${id}:`, error);
            throw error;
        }
    }

    async clear() {
        try {
            await this.ensureConnected();
            await this.db.run('DELETE FROM items');
            return true;
        } catch (error) {
            console.error('Error clearing database:', error);
            throw error;
        }
    }

    async close() {
        if (this.db) {
            await this.db.close();
            this.isConnected = false;
        }
    }
}

// Create a global database instance
const database = new Database();

// Initialize database function
async function initDatabase() {
    try {
        await database.connect();
        return database;
    } catch (error) {
        console.error('Failed to initialize database:', error);
        process.exit(1);
    }
}

module.exports = { Database, database, initDatabase };
