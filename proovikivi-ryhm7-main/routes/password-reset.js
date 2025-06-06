const express = require('express');
const router = express.Router();
const pool = require('../src/databasepool').pool;
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'noreply8249907@gmail.com',
    pass: 'ubes loeb potz cgfd'
  }
});

router.get('/', (req, res) => {
  res.render('password-reset');
});

router.post('/', async (req, res) => {
  const { email } = req.body;
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    const [results] = await pool.execute(
      'SELECT id FROM user WHERE email = ?',
      [email]
    );
    if (results.length === 0) {
      return res.render('password-reset', { errorMessage: 'E-posti ei leitud' });
    }
    const userId = results[0].id;

    await pool.execute(
      `UPDATE user 
       SET reset_token = ?, token_expire = DATE_ADD(NOW(), INTERVAL 5 MINUTE)
       WHERE id = ?`,
      [verificationCode, userId]
    );

    const mailOptions = {
      from: 'proovikivi',
      to: email,
      subject: 'Proovikivi parooli taastamise kood',
      text: `Teie parooli taastamise kood: ${verificationCode}\nKood kehtib 5 minutit!`
    };
    await transporter.sendMail(mailOptions);

    res.render('verify-code', { email });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

router.post('/verify', async (req, res) => {
  const { email, code1, code2, code3, code4, code5, code6 } = req.body;
  const verificationCode = `${code1}${code2}${code3}${code4}${code5}${code6}`;

  try {
    const [results] = await pool.execute(
      `SELECT id FROM user 
       WHERE email = ? 
         AND reset_token = ? 
         AND token_expire > NOW()`,
      [email, verificationCode]
    );

    if (results.length === 0) {
      return res.render('verify-code', {
        email,
        errorMessage: 'Vale või aegunud kood'
      });
    }

    res.render('reset-password', { email, verificationCode });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

router.post('/reset', async (req, res) => {
  const { email, verificationCode, newPassword, confirmPassword } = req.body;

  if (newPassword !== confirmPassword) {
    return res.render('reset-password', {
      email,
      verificationCode,
      errorMessage: 'Paroolid on erinevad!'
    });
  }

  const validatePassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return regex.test(password);
  };
  if (!validatePassword(newPassword)) {
    return res.render('reset-password', {
      email,
      verificationCode,
      errorMessage:
        'Parool peab olema vähemalt 8 tähemärki, sisaldama suuri ja väikseid tähti ning numbreid!'
    });
  }

  try {
    const [results] = await pool.execute(
      `SELECT id FROM user 
       WHERE email = ? 
         AND reset_token = ? 
         AND token_expire > NOW()`,
      [email, verificationCode]
    );
    if (results.length === 0) {
      return res.render('reset-password', {
        email,
        verificationCode,
        errorMessage: 'Vale või aegunud kood'
      });
    }

    const userId = results[0].id;
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.execute(
      `UPDATE user 
       SET password = ?, reset_token = NULL, token_expire = NULL 
       WHERE id = ?`,
      [hashedPassword, userId]
    );

    res.render('reset-success');
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
