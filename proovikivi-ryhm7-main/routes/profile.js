const express = require('express');
const pool = require('../src/databasepool').pool;
const router = express.Router();
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage });

function isAuthenticated(req, res, next) {
    if (req.session.userId) {
        next();  
    } else {
        res.redirect('/login'); 
    }
}

router.get('/', isAuthenticated, async (req, res) => {
    const userId = req.session.userId;

    pool.execute('SELECT username, email, gender_id, birthdate, user_type_id, institution_id, profile_picture FROM user WHERE id = ?', [userId], (err, results) => {
        if (err) {
            console.error('Error fetching user data:', err);
            res.status(500).send('Internal Server Error');
            return;
        }

        if (results.length === 0) {
            console.error('Error: No user found with id:', userId);
            res.status(404).send('User Not Found');
            return;
        }

        const user = results[0];

        if (user.profile_picture) {
            user.profile_picture = `data:image/jpeg;base64,${Buffer.from(user.profile_picture).toString('base64')}`;
        }

        // Ensure birthdate is treated as a UTC date and only the date part is sent
        user.birthdate = new Date(user.birthdate).toISOString().split('T')[0];

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

                    res.render('profile', { user, genders, userTypes, institutions });
                });
            });
        });
    });
});

router.post('/', upload.single('newProfilePicture'), isAuthenticated, async (req, res) => {
    const { username, email, gender, birthdate, userType, institutionId, croppedImage } = req.body;
    const userId = req.session.userId;

    if (!userId || !username || !email || !gender || !birthdate || !userType) {
        console.error('Error: Missing required parameters');
        res.status(400).send('Bad Request');
        return;
    }

    // Prepare birthdate and update query
    const birthdateObj = new Date(birthdate);
    birthdateObj.setDate(birthdateObj.getDate() + 1);
    const formattedBirthdate = birthdateObj.toISOString().split('T')[0];

    let updateQuery = 'UPDATE user SET username = ?, email = ?, gender_id = ?, birthdate = ?, user_type_id = ?, institution_id = ?';
    const updateValues = [username, email, gender, formattedBirthdate, userType, institutionId || null];

    // Check if there's a new profile picture
    if (croppedImage) {
        const profilePictureBuffer = Buffer.from(croppedImage.split(',')[1], 'base64');
        updateQuery += ', profile_picture = ?';
        updateValues.push(profilePictureBuffer);
    }

    updateQuery += ' WHERE id = ?';
    updateValues.push(userId);

    pool.execute(updateQuery, updateValues, (err, results) => {
        if (err) {
            console.error('Error updating user data:', err);
            res.status(500).send('Internal Server Error');
            return;
        }

        res.redirect('/profile');
    });
});

module.exports = router;
