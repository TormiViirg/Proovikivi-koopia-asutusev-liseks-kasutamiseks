const express = require('express');
const pool = require('../src/databasepool').pool;
const router = express.Router();
const multer = require('multer');
const { Buffer } = require('buffer');

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

  try {

    const [userRows] = await pool.execute(
      'SELECT username, email, gender_id, birthdate, user_type_id, institution_id, profile_picture FROM user WHERE id = ?',
      [userId]
    );

    if (userRows.length === 0) {
      console.error('Error: No user found with id:', userId);
      return res.status(404).send('User Not Found');
    }

    const user = { ...userRows[0] };

    if (user.profile_picture) {
      user.profile_picture = `data:image/jpeg;base64,${Buffer.from(
        user.profile_picture
      ).toString('base64')}`;
    }

    user.birthdate = new Date(user.birthdate)
      .toISOString()
      .split('T')[0];

    const [
      [genders],
      [userTypes],
      [institutions],
    ] = await Promise.all([
      pool.execute('SELECT id, name FROM gender'),
      pool.execute('SELECT id, name FROM user_type'),
      pool.execute('SELECT id, name FROM institution'),
    ]);

    res.render('profile', { user, genders, userTypes, institutions });
  } catch (err) {
    console.error('Error fetching user data:', err);
    res.status(500).send('Internal Server Error');
  }
});

router.post(
  '/',
  upload.single('newProfilePicture'),
  isAuthenticated,
  async (req, res) => {
    const {
      username,
      email,
      gender,
      birthdate,
      userType,
      institutionId,
      croppedImage,
    } = req.body;
    const userId = req.session.userId;

    if (!userId || !username || !email || !gender || !birthdate || !userType) {
      console.error('Error: Missing required parameters');
      return res.status(400).send('Bad Request');
    }

    try {

      const birthdateObj = new Date(birthdate);
      birthdateObj.setDate(birthdateObj.getDate() + 1);
      const formattedBirthdate = birthdateObj
        .toISOString()
        .split('T')[0];

      let updateQuery =
        'UPDATE user SET username = ?, email = ?, gender_id = ?, birthdate = ?, user_type_id = ?, institution_id = ?';
      const updateValues = [
        username,
        email,
        gender,
        formattedBirthdate,
        userType,
        institutionId || null,
      ];

      if (croppedImage) {
        const buffer = Buffer.from(croppedImage.split(',')[1], 'base64');
        updateQuery += ', profile_picture = ?';
        updateValues.push(buffer);
      }

      updateQuery += ' WHERE id = ?';
      updateValues.push(userId);

      await pool.execute(updateQuery, updateValues);

      res.redirect('/profile');
    } catch (err) {
      console.error('Error updating user data:', err);
      res.status(500).send('Internal Server Error');
    }
  }
);

module.exports = router;
