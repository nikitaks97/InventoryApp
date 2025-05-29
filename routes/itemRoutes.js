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
            // Trim and validate input
            const name = req.body.name ? req.body.name.toString().trim() : '';
            const description = req.body.description ? req.body.description.toString().trim() : '';
            const quantity = parseInt(req.body.quantity, 10);

            // Validate required fields
            if (!name || !description) {
                if (req.flash) {
                    req.flash('error', 'Name and description are required');
                    return res.redirect('/items/new');
                } else {
                    return res.status(200).render('items/new', { 
                        title: 'New Item',
                        error: 'Name and description are required'
                    });
                }
            }

            // Validate quantity
            if (isNaN(quantity) || quantity < 0) {
                if (req.flash) {
                    req.flash('error', 'Quantity must be a non-negative number');
                    return res.redirect('/items/new');
                } else {
                    return res.status(200).render('items/new', { 
                        title: 'New Item',
                        error: 'Quantity must be a non-negative number'
                    });
                }
            }

            const itemData = { name, description, quantity };
            await database.create(itemData);
            if (req.flash) {
                req.flash('success', 'Item created successfully!');
            }
            res.redirect('/items');
        } catch (error) {
            if (error.message.includes('unique')) {
                if (req.flash) {
                    req.flash('error', 'An item with this name already exists');
                    res.redirect('/items/new');
                } else {
                    res.status(200).render('items/new', { 
                        title: 'New Item',
                        error: 'An item with this name already exists'
                    });
                }
            } else if (error.message.includes('required')) {
                if (req.flash) {
                    req.flash('error', error.message);
                    res.redirect('/items/new');
                } else {
                    res.status(200).render('items/new', { 
                        title: 'New Item',
                        error: error.message
                    });
                }
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
            // Get the existing item to merge with updated data
            let existingItem;
            try {
                existingItem = await database.findById(req.params.id);
            } catch (error) {
                if (error.message.includes('not found')) {
                    if (req.flash) {
                        req.flash('error', 'Item not found');
                        return res.redirect('/items');
                    } else {
                        return res.status(404).render('error', { 
                            message: 'Item not found',
                            error: {}
                        });
                    }
                }
                throw error;
            }
            
            // Trim and validate input, keeping existing values if not provided
            const name = req.body.name ? req.body.name.toString().trim() : existingItem.name;
            const description = req.body.description ? req.body.description.toString().trim() : existingItem.description;
            const quantity = req.body.quantity !== undefined ? parseInt(req.body.quantity, 10) : existingItem.quantity;

            // Validate required fields
            if (!name || !description) {
                if (req.flash) {
                    req.flash('error', 'Name and description are required');
                    return res.redirect(`/items/${req.params.id}/edit`);
                } else {
                    return res.status(200).render('items/edit', { 
                        item: existingItem,
                        title: 'Edit Item',
                        error: 'Name and description are required'
                    });
                }
            }

            // Validate quantity
            if (isNaN(quantity) || quantity < 0) {
                if (req.flash) {
                    req.flash('error', 'Quantity must be a non-negative number');
                    return res.redirect(`/items/${req.params.id}/edit`);
                } else {
                    return res.status(200).render('items/edit', { 
                        item: existingItem,
                        title: 'Edit Item',
                        error: 'Quantity must be a non-negative number'
                    });
                }
            }

            const itemData = { name, description, quantity };
            await database.update(req.params.id, itemData);
            if (req.flash) {
                req.flash('success', 'Item updated successfully!');
            }
            res.redirect('/items');
        } catch (error) {
            if (error.message.includes('unique')) {
                if (req.flash) {
                    req.flash('error', 'An item with this name already exists');
                    res.redirect(`/items/${req.params.id}/edit`);
                } else {
                    res.status(200).render('items/edit', { 
                        item: { _id: req.params.id, name: req.body.name, description: req.body.description, quantity: req.body.quantity },
                        title: 'Edit Item',
                        error: 'An item with this name already exists'
                    });
                }
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
