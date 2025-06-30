require('dotenv').config();
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const flash = require('connect-flash');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const path = require('path');
const { initDatabase } = require('./db');
const itemRoutes = require('./routes/itemRoutes');

function createApp() {
    const app = express();

    // View engine setup
    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, 'views'));

    // Layout setup
    app.use(expressLayouts);
    app.set('layout', 'layout');
    app.set('layout extractScripts', true);
    app.set('layout extractStyles', true);

    // Session setup
    app.use(session({
        secret: process.env.SESSION_SECRET || 'keyboard cat',
        resave: false,
        saveUninitialized: false,
        cookie: { secure: process.env.NODE_ENV === 'production' },
        store: new SQLiteStore({
            db: 'sessions.db',
            dir: './data'
        })
    }));

    // Flash messages setup
    app.use(flash());

    // Middleware
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());
    app.use(express.static('public'));

    // Flash messages middleware
    app.use((req, res, next) => {
        res.locals.messages = req.flash ? req.flash() : {};
        next();
    });

    // Routes
    app.use('/items', itemRoutes());
    app.get('/', (req, res) => res.redirect('/items'));

    // Error handling middleware
    app.use((err, req, res, next) => {
        console.error(err.stack);
        res.status(500).render('error', {
            message: 'Something went wrong!',
            error: process.env.NODE_ENV === 'development' ? err : {}
        });
    });

    return app;
}

// Only start the server if this file is run directly
if (require.main === module) {
    (async () => {
        try {
            const app = createApp();
            const db = await initDatabase();
            app.locals.db = db;

            const PORT = process.env.PORT || 3000;
            app.listen(PORT, () => console.log(`🌐 Server running at http://localhost:${PORT}`));
        } catch (err) {
            console.error('Failed to start server:', err);
            process.exit(1);
        }
    })();
}

module.exports = createApp;
