const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../src/databasepool').pool;
const router = express.Router();

async function getMetadata() {
  const [genders] = await pool.execute('SELECT id, name FROM gender');
  const [userTypes] = await pool.execute('SELECT id, name FROM user_type');
  const [institutions] = await pool.execute('SELECT id, name FROM institution');
  return { genders, userTypes, institutions };
}

router.get('/', async (req, res) => {
  try {
    const { genders, userTypes, institutions } = await getMetadata();
    res.render('signup', { genders, userTypes, institutions });
  } catch (err) {
    console.error('Error fetching genders/user types/institutions:', err);
    res.status(500).send('Internal Server Error');
  }
});

router.post('/', async (req, res) => {
  const {
    fullnameInput,
    emailInput,
    genderInput,
    birthInput,
    userTypeInput,
    passwordInput,
    confirmPasswordInput,
    croppedImage
  } = req.body;
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
    try {
      const { genders, userTypes, institutions } = await getMetadata();
      return res.render('signup', { genders, userTypes, institutions, errorMessage });
    } catch (err) {
      console.error('Error fetching genders/user types/institutions:', err);
      return res.status(500).send('Internal Server Error');
    }
  }

  try {
    const [existingUsers] = await pool.execute(
      'SELECT id FROM user WHERE email = ?',
      [emailInput]
    );

    if (existingUsers.length > 0) {
      errorMessage = 'E-post on juba registreeritud!';
      const { genders, userTypes, institutions } = await getMetadata();
      return res.render('signup', { genders, userTypes, institutions, errorMessage });
    }

    const handleUserInsertion = async (institutionId) => {
      const hashedPassword = await bcrypt.hash(passwordInput, 10);
      const sql =
        'INSERT INTO user (username, email, gender_id, birthdate, user_type_id, institution_id, password, profile_picture) VALUES (?,?,?,?,?,?,?,?)';
      const imageBuffer = Buffer.from(
        croppedImage.replace(/^data:image\/\w+;base64,/, ''),
        'base64'
      );

      await pool.execute(sql, [
        fullnameInput,
        emailInput,
        genderInput,
        birthInput,
        userTypeInput,
        institutionId,
        hashedPassword,
        imageBuffer
      ]);

      return res.render('accountCreated');
    };

    if (institutionsInput) {

      const [instResults] = await pool.execute(
        'SELECT id FROM institution WHERE name = ?',
        [institutionsInput]
      );

      if (instResults.length === 0) {
        errorMessage = 'Asutust ei leitud!';
        const { genders, userTypes, institutions } = await getMetadata();
        return res.render('signup', { genders, userTypes, institutions, errorMessage });
      }

      const institutionId = instResults[0].id;
      return await handleUserInsertion(institutionId);
    } else {

      return await handleUserInsertion(null);
    }
  } catch (err) {
    console.error('Error during signup process:', err);
    return res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
