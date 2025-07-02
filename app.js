require('dotenv').config();
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const path = require('path');
const app = express();

// Use ONLY the injected Railway port
const PORT = process.env.PORT;

if (!PORT) {
    console.error("❌ PORT is not defined. Railway must inject it.");
    process.exit(1);
}

const PASSWORD_HASH = bcrypt.hashSync(process.env.APP_PASSWORD, 10);

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

// Auth middleware
function isAuthenticated(req, res, next) {
    if (req.session && req.session.loggedIn) {
        return next();
    }
    res.redirect('/login');
}

// Routes
app.get('/login', (req, res) => {
    res.render('login', { error: null });
});

app.post('/login', (req, res) => {
    const { password } = req.body;
    if (bcrypt.compareSync(password, PASSWORD_HASH)) {
        req.session.loggedIn = true;
        res.redirect('/');
    } else {
        res.render('login', { error: 'Invalid password' });
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
});

app.get('/', isAuthenticated, (req, res) => {
    res.render('dashboard', {
        emailStats: { new: 24, total: 24, today: 24 },
        lastCheck: '6/30/2025, 9:30:04 AM'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});
