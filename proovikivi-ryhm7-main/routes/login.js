const express = require('express');
const router = express.Router();
const pool = require('../src/databasepool').pool;
const bcrypt = require('bcrypt');

router.get('/', (req, res) => {
    res.render('login');
});

router.post('/', (req, res) => {
    const { loginEmail, passwordInput } = req.body;

    pool.execute('SELECT id, username, password FROM user WHERE email = ?', [loginEmail], (err, results) => {
        if (err) {
            console.error('Error fetching user from database: ', err);
            res.status(500).send('Internal Server Error');
            return;
        }

        if (results.length === 0) {
            return res.render('login', { errorMessage: 'Vale e-post või parool' });
        }

        const user = results[0];

        bcrypt.compare(passwordInput, user.password, (err, passwordMatch) => {
            if (err) {
                console.error('Error comparing passwords: ', err);
                res.status(500).send('Internal Server Error');
                return;
            }

            if (!passwordMatch) {
                return res.render('login', { errorMessage: 'Vale e-post või parool' });
            }

            req.session.userId = user.id;
            req.session.username = user.username;

            res.redirect('/projects');
        });
    });
});

module.exports = router;