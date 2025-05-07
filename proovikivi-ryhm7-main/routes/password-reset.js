const express = require('express');
const router = express.Router();
const pool = require('../src/databasepool').pool;
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');

// Nodemailer setup
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

router.post('/', (req, res) => {
    const { email } = req.body;
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    pool.execute('SELECT id FROM user WHERE email = ?', [email], (err, results) => {
        if (err) {
            console.error('Error fetching user:', err);
            res.status(500).send('Internal Server Error');
            return;
        }

        if (results.length === 0) {
            res.render('password-reset', { errorMessage: 'E-posti ei leitud' });
            return;
        }

        const userId = results[0].id;

        pool.execute('UPDATE user SET reset_token = ?, token_expire = DATE_ADD(NOW(), INTERVAL 5 MINUTE) WHERE id = ?',
            [verificationCode, userId], (err) => {
            if (err) {
                console.error('Error updating user with reset token:', err);
                res.status(500).send('Internal Server Error');
                return;
            }

            const mailOptions = {
                from: 'proovikivi',
                to: email,
                subject: 'Proovikivi parooli taastamise kood',
                text: `Teie parooli taastamise kood: ${verificationCode}\nKood kehtib 5 minutit!`
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error('Error sending email:', error);
                    res.status(500).send('Internal Server Error');
                } else {
                    res.render('verify-code', { email: email });
                }
            });
        });
    });
});

router.post('/verify', (req, res) => {
    const { email, code1, code2, code3, code4, code5, code6 } = req.body;
    const verificationCode = `${code1}${code2}${code3}${code4}${code5}${code6}`;

    pool.execute('SELECT id FROM user WHERE email = ? AND reset_token = ? AND token_expire > NOW()', [email, verificationCode], (err, results) => {
        if (err) {
            console.error('Error verifying code:', err);
            res.status(500).send('Internal Server Error');
            return;
        }

        if (results.length === 0) {
            res.render('verify-code', { email: email, errorMessage: 'Vale või aegunud kood' });
            return;
        }

        res.render('reset-password', { email: email, verificationCode: verificationCode });
    });
});

router.post('/reset', (req, res) => {
    const { email, verificationCode, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
        res.render('reset-password', { email: email, verificationCode: verificationCode, errorMessage: 'Paroolid on erinevad!' });
        return;
    }

    const validatePassword = (password) => {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        return regex.test(password);
    };

    if (!validatePassword(newPassword)) {
        res.render('reset-password', { email: email, verificationCode: verificationCode, errorMessage: 'Parool peab olema vähemalt 8 tähemärki, sisaldama suuri ja väikseid tähti ning numbreid!' });
        return;
    }

    pool.execute('SELECT id FROM user WHERE email = ? AND reset_token = ? AND token_expire > NOW()', [email, verificationCode], (err, results) => {
        if (err) {
            console.error('Error verifying code:', err);
            res.status(500).send('Internal Server Error');
            return;
        }

        if (results.length === 0) {
            res.render('reset-password', { email: email, verificationCode: verificationCode, errorMessage: 'Vale või aegunud kood' });
            return;
        }

        const userId = results[0].id;

        bcrypt.genSalt(10, (err, salt) => {
            if (err) {
                console.error('Error generating salt:', err);
                res.status(500).send('Internal Server Error');
                return;
            }

            bcrypt.hash(newPassword, salt, (err, hashedPassword) => {
                if (err) {
                    console.error('Error hashing password:', err);
                    res.status(500).send('Internal Server Error');
                    return;
                }

                pool.execute('UPDATE user SET password = ?, reset_token = NULL, token_expire = NULL WHERE id = ?', [hashedPassword, userId], (err) => {
                    if (err) {
                        console.error('Error updating password:', err);
                        res.status(500).send('Internal Server Error');
                        return;
                    }

                    res.render('reset-success');
                });
            });
        });
    });
});

module.exports = router;
