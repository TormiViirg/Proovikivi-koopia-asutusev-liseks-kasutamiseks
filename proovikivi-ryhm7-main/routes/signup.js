const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../src/databasepool').pool;
const router = express.Router();

router.get('/', (req, res) => {
    pool.execute('SELECT id, name FROM gender', (err, genders) => {
        if (err) {
            console.error('Error fetching genders:', err);
            res.status(500).send('Internal Server Error');
            return;
        }

        pool.execute('SELECT id, name FROM user_type', (err, userTypes) => {
            if (err) {
                console.error('Error fetching user types:', err);
                res.status(500).send('Internal Server Error');
                return;
            }

            pool.execute('SELECT id, name FROM institution', (err, institutions) => {
                if (err) {
                    console.error('Error fetching institutions:', err);
                    res.status(500).send('Internal Server Error');
                    return;
                }

                res.render('signup', { genders: genders, userTypes: userTypes, institutions: institutions });
            });
        });
    });
});

router.post('/', (req, res) => {
    const { fullnameInput, emailInput, genderInput, birthInput, userTypeInput, passwordInput, confirmPasswordInput, croppedImage } = req.body;
    let { institutionsInput } = req.body;

    if (!institutionsInput) {
        institutionsInput = null;
    }

    const validatePassword = (password) => {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        return regex.test(password);
    };

    let errorMessage = '';

    if (!fullnameInput || !emailInput || !genderInput || !birthInput || !userTypeInput) {
        errorMessage = 'Kõik kohustuslikud väljad ei ole täidetud!';
    } else if (!validatePassword(passwordInput)) {
        errorMessage = 'Parool peab olema vähemalt 8 tähemärki, sisaldama suuri ja väikseid tähti ning numbreid!';
    } else if (passwordInput !== confirmPasswordInput) {
        errorMessage = 'Paroolid on erinevad!';
    }

    if (errorMessage) {
        pool.execute('SELECT id, name FROM gender', (err, genders) => {
            if (err) {
                console.error('Error fetching genders:', err);
                res.status(500).send('Internal Server Error');
                return;
            }

            pool.execute('SELECT id, name FROM user_type', (err, userTypes) => {
                if (err) {
                    console.error('Error fetching user types:', err);
                    res.status(500).send('Internal Server Error');
                    return;
                }

                pool.execute('SELECT id, name FROM institution', (err, institutions) => {
                    if (err) {
                        console.error('Error fetching institutions:', err);
                        res.status(500).send('Internal Server Error');
                        return;
                    }

                    res.render('signup', { genders: genders, userTypes: userTypes, institutions: institutions, errorMessage: errorMessage });
                });
            });
        });

        return;
    }

    // check if email already exists
    pool.execute('SELECT id FROM user WHERE email = ?', [emailInput], (err, results) => {
        if (err) {
            console.error('Error checking email existence:', err);
            res.status(500).send('Internal Server Error');
            return;
        }

        if (results.length > 0) {
            let errorMessage = 'E-post on juba registreeritud!';

            pool.execute('SELECT id, name FROM gender', (err, genders) => {
                if (err) {
                    console.error('Error fetching genders:', err);
                    res.status(500).send('Internal Server Error');
                    return;
                }

                pool.execute('SELECT id, name FROM user_type', (err, userTypes) => {
                    if (err) {
                        console.error('Error fetching user types:', err);
                        res.status(500).send('Internal Server Error');
                        return;
                    }

                    pool.execute('SELECT id, name FROM institution', (err, institutions) => {
                        if (err) {
                            console.error('Error fetching institutions:', err);
                            res.status(500).send('Internal Server Error');
                            return;
                        }

                        res.render('signup', { genders: genders, userTypes: userTypes, institutions: institutions, errorMessage: errorMessage });
                    });
                });
            });

            return;
        }

        const handleUserInsertion = (institutionId) => {
            bcrypt.genSalt(10, (err, salt) => {
                if (err) {
                    console.error('Error generating salt:', err);
                    res.status(500).send('Internal Server Error');
                    return;
                }

                bcrypt.hash(passwordInput, salt, (err, hashedPassword) => {
                    if (err) {
                        console.error('Error hashing password:', err);
                        res.status(500).send('Internal Server Error');
                        return;
                    }

                    let sql = 'INSERT INTO user (username, email, gender_id, birthdate, user_type_id, institution_id, password, profile_picture) VALUES (?,?,?,?,?,?,?,?)';

                    pool.getConnection((err, conn) => {
                        if (err) {
                            console.error('Error getting database connection:', err);
                            res.status(500).send('Internal Server Error');
                            return;
                        }

                        const imageBuffer = Buffer.from(croppedImage.replace(/^data:image\/\w+;base64,/, ""), 'base64');

                        conn.execute(sql, [fullnameInput, emailInput, genderInput, birthInput, userTypeInput, institutionId, hashedPassword, imageBuffer], (err, result) => {
                            if (err) {
                                console.error('Error inserting user into database:', err);
                                res.render('signup');
                                return;
                            }
                            res.render('accountCreated');
                            conn.release();
                        });
                    });
                });
            });
        };

        if (institutionsInput) {
            pool.execute('SELECT id FROM institution WHERE name = ?', [institutionsInput], (err, results) => {
                if (err) {
                    console.error('Error fetching institution ID:', err);
                    res.status(500).send('Internal Server Error');
                    return;
                }

                if (results.length === 0) {
                    let errorMessage = 'Asutust ei leitud!';
                    pool.execute('SELECT id, name FROM gender', (err, genders) => {
                        if (err) {
                            console.error('Error fetching genders:', err);
                            res.status(500).send('Internal Server Error');
                            return;
                        }

                        pool.execute('SELECT id, name FROM user_type', (err, userTypes) => {
                            if (err) {
                                console.error('Error fetching user types:', err);
                                res.status(500).send('Internal Server Error');
                                return;
                            }

                            pool.execute('SELECT id, name FROM institution', (err, institutions) => {
                                if (err) {
                                    console.error('Error fetching institutions:', err);
                                    res.status(500).send('Internal Server Error');
                                    return;
                                }

                                res.render('signup', { genders: genders, userTypes: userTypes, institutions: institutions, errorMessage: errorMessage });
                            });
                        });
                    });

                    return;
                }

                const institutionId = results[0].id;
                handleUserInsertion(institutionId);
            });
        } else {
            handleUserInsertion(null);
        }
    });
});

module.exports = router;
