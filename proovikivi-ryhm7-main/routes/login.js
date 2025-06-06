const express = require('express');
const router = express.Router();
const pool = require('../src/databasepool').pool;
const bcrypt = require('bcrypt');

router.get('/', (req, res) => {
  res.render('login');
});

router.post('/', async (req, res) => {
  const { loginEmail, passwordInput } = req.body;

  try {
    const [results] = await pool.execute(
      'SELECT id, username, password FROM user WHERE email = ?',
      [loginEmail]
    );
    if (results.length === 0) {
      return res.render('login', { errorMessage: 'Vale e-post või parool' });
    }

    const user = results[0];
    const passwordMatch = await bcrypt.compare(passwordInput, user.password);
    if (!passwordMatch) {
      return res.render('login', { errorMessage: 'Vale e-post või parool' });
    }

    req.session.userId = user.id;
    req.session.username = user.username;
    res.redirect('/projects');
  } catch (err) {
    console.error('Error logging in:', err);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
