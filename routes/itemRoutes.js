const express = require('express');
const { database } = require('../db');

function itemRoutes() {
    const router = express.Router();

    // GET /items - List all items
    router.get('/', async (req, res, next) => {
        try {
            const items = await database.findAll();
            res.render('items/index', { items, title: 'Items' });
        } catch (error) {
            next(error);
        }
    });

    // GET /items/new - Show new item form
    router.get('/new', (req, res) => {
        res.render('items/new', { title: 'New Item' });
    });

    // POST /items - Create new item
    router.post('/', async (req, res, next) => {
        try {
            const itemData = {
                name: req.body.name,
                description: req.body.description,
                quantity: parseInt(req.body.quantity, 10)
            };

            await database.create(itemData);
            res.redirect('/items');
        } catch (error) {
            if (error.message.includes('unique')) {
                res.render('items/new', {
                    error: 'An item with this name already exists',
                    item: req.body,
                    title: 'New Item'
                });
            } else if (error.message.includes('required')) {
                res.render('items/new', {
                    error: error.message,
                    item: req.body,
                    title: 'New Item'
                });
            } else {
                next(error);
            }
        }
    });

    // GET /items/:id/edit - Show edit form
    router.get('/:id/edit', async (req, res, next) => {
        try {
            const item = await database.findById(req.params.id);
            res.render('items/edit', { item, title: 'Edit Item' });
        } catch (error) {
            next(error);
        }
    });

    // POST /items/:id - Update item
    router.post('/:id', async (req, res, next) => {
        try {
            const itemData = {
                name: req.body.name,
                description: req.body.description,
                quantity: parseInt(req.body.quantity, 10)
            };

            await database.update(req.params.id, itemData);
            res.redirect('/items');
        } catch (error) {
            if (error.message.includes('unique')) {
                const item = { ...req.body, _id: req.params.id };
                res.render('items/edit', {
                    error: 'An item with this name already exists',
                    item,
                    title: 'Edit Item'
                });
            } else {
                next(error);
            }
        }
    });

    // DELETE /items/:id - Delete item
    router.delete('/:id', async (req, res, next) => {
        try {
            const numRemoved = await database.delete(req.params.id);
            if (numRemoved === 0) {
                return res.status(404).json({ success: false, error: 'Item not found' });
            }
            res.status(204).end();
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    return router;
}

module.exports = itemRoutes;
