const mongoose = require('mongoose');
const Datastore = require('nedb-promises');
const path = require('path');

class Database {
    constructor() {
        this.db = null;
    }

    async connect() {
        try {
            this.db = Datastore.create({
                filename: path.join(__dirname, '../data/items.db'),
                timestampData: true,
                autoload: true
            });

            // Create indexes
            await this.db.ensureIndex({ fieldName: 'name', unique: true });
            
            console.log('📦 Database connected successfully');
            return this.db;
        } catch (error) {
            console.error('Database connection error:', error);
            throw new Error('Failed to connect to database');
        }
    }

    async findAll() {
        try {
            return await this.db.find({}).sort({ createdAt: -1 });
        } catch (error) {
            console.error('Error finding items:', error);
            throw new Error('Failed to retrieve items');
        }
    }

    async findById(id) {
        try {
            const item = await this.db.findOne({ _id: id });
            if (!item) {
                throw new Error('Item not found');
            }
            return item;
        } catch (error) {
            console.error(`Error finding item ${id}:`, error);
            throw error;
        }
    }

    async create(itemData) {
        try {
            // Validate required fields
            if (!itemData.name || !itemData.description) {
                throw new Error('Name and description are required');
            }

            // Validate quantity is a positive number
            if (typeof itemData.quantity !== 'number' || itemData.quantity < 0) {
                throw new Error('Quantity must be a positive number');
            }

            return await this.db.insert(itemData);
        } catch (error) {
            console.error('Error creating item:', error);
            throw error;
        }
    }

    async update(id, itemData) {
        try {
            // Validate required fields
            if (!itemData.name || !itemData.description) {
                throw new Error('Name and description are required');
            }

            // Validate quantity is a positive number
            if (typeof itemData.quantity !== 'number' || itemData.quantity < 0) {
                throw new Error('Quantity must be a positive number');
            }

            const updated = await this.db.update(
                { _id: id },
                { $set: itemData },
                { returnUpdatedDocs: true }
            );

            if (updated === 0) {
                throw new Error('Item not found');
            }

            return updated;
        } catch (error) {
            console.error(`Error updating item ${id}:`, error);
            throw error;
        }
    }

    async delete(id) {
        try {
            const numRemoved = await this.db.remove({ _id: id });
            if (numRemoved === 0) {
                throw new Error('Item not found');
            }
            return numRemoved;
        } catch (error) {
            console.error(`Error deleting item ${id}:`, error);
            throw error;
        }
    }
}

const database = new Database();

async function initDatabase() {
    try {
        return await database.connect();
    } catch (error) {
        console.error('Failed to initialize database:', error);
        process.exit(1);
    }
}

module.exports = {
    initDatabase,
    database
};
