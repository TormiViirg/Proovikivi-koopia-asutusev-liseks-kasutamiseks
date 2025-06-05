// routes/admin-panel.js

const express = require('express');
const { pool } = require('../src/databasepool'); // <-- ensure this actually exports { pool }
const router = express.Router();

// Utility: split a textarea string into trimmed, non‐empty lines
function parseLines(text) {
  if (!text) return [];
  return text
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.length > 0);
}

// ─── GET /admin-panel ────────────────────────────────────────────────────────────
// Fetch all six lookup tables via pool.query(), then render admin-panel.ejs
router.get('/', async (req, res, next) => {
  try {
    // 1) gender(name)
    const [genders] = await pool.query('SELECT name FROM gender ORDER BY id');

    // 2) user_type(name)
    const [userTypes] = await pool.query('SELECT name FROM user_type ORDER BY id');

    // 3) school_subject(name)
    const [schoolSubjects] = await pool.query('SELECT name FROM school_subject ORDER BY id');

    // 4) global_goal(title)
    const [globalGoals] = await pool.query('SELECT title FROM global_goal ORDER BY id');

    // 5) proovikivi(title)
    const [proovikivid] = await pool.query('SELECT title FROM proovikivi ORDER BY id');

    // 6) location(name)
    const [locations] = await pool.query('SELECT name FROM location ORDER BY id');

    // Now render the template, passing all six arrays
    return res.render('admin-panel', {
      genders,         // [ { name: 'Mees' }, { name: 'Naine' }, … ]
      userTypes,       // [ { name: 'Õpilane' }, … ]
      schoolSubjects,  // [ { name: 'Eesti keel' }, … ]
      globalGoals,     // [ { title: 'Kaotada vaesus' }, … ]
      proovikivid,     // [ { title: 'Energia julgeolek…' }, … ]
      locations        // [ { name: 'Tallinn' }, … ]
    });
  } catch (err) {
    return next(err);
  }
});

// ─── POST /admin-panel ────────────────────────────────────────────────────────────
// Parse each textarea, skip duplicates, insert any new lines into the six tables
router.post('/', async (req, res, next) => {
  const {
    genders: rawGenders,
    userTypes: rawUserTypes,
    schoolSubjects: rawSchoolSubjects,
    globalGoals: rawGlobalGoals,
    proovikivid: rawProovikivid,
    locations: rawLocations
  } = req.body;

  const genders        = parseLines(rawGenders);
  const userTypes      = parseLines(rawUserTypes);
  const schoolSubjects = parseLines(rawSchoolSubjects);
  const globalGoals    = parseLines(rawGlobalGoals);
  const proovikivid    = parseLines(rawProovikivid);
  const locations      = parseLines(rawLocations);

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // 1) Insert into `gender` if not exists
    for (const name of genders) {
      const [rows] = await connection.query(
        'SELECT id FROM gender WHERE name = ?',
        [name]
      );
      if (rows.length === 0) {
        await connection.query(
          'INSERT INTO gender (name) VALUES (?)',
          [name]
        );
      }
    }

    // 2) Insert into `user_type`
    for (const name of userTypes) {
      const [rows] = await connection.query(
        'SELECT id FROM user_type WHERE name = ?',
        [name]
      );
      if (rows.length === 0) {
        await connection.query(
          'INSERT INTO user_type (name) VALUES (?)',
          [name]
        );
      }
    }

    // 3) Insert into `school_subject`
    for (const name of schoolSubjects) {
      const [rows] = await connection.query(
        'SELECT id FROM school_subject WHERE name = ?',
        [name]
      );
      if (rows.length === 0) {
        await connection.query(
          'INSERT INTO school_subject (name) VALUES (?)',
          [name]
        );
      }
    }

    // 4) Insert into `global_goal` (image is BLOB NOT NULL → empty buffer)
    for (const title of globalGoals) {
      const [rows] = await connection.query(
        'SELECT id FROM global_goal WHERE title = ?',
        [title]
      );
      if (rows.length === 0) {
        await connection.query(
          'INSERT INTO global_goal (image, title) VALUES (?, ?)',
          [Buffer.alloc(0), title]
        );
      }
    }

    // 5) Insert into `proovikivi` (title, image, goal=NULL)
    for (const title of proovikivid) {
      const [rows] = await connection.query(
        'SELECT id FROM proovikivi WHERE title = ?',
        [title]
      );
      if (rows.length === 0) {
        await connection.query(
          'INSERT INTO proovikivi (title, image, goal) VALUES (?, ?, NULL)',
          [title, Buffer.alloc(0)]
        );
      }
    }

    // 6) Insert into `location`
    for (const name of locations) {
      const [rows] = await connection.query(
        'SELECT id FROM location WHERE name = ?',
        [name]
      );
      if (rows.length === 0) {
        await connection.query(
          'INSERT INTO location (name) VALUES (?)',
          [name]
        );
      }
    }

    await connection.commit();
    connection.release();

    return res.redirect('/admin-panel');
  } catch (error) {
    if (connection) {
      await connection.rollback();
      connection.release();
    }
    console.error('Error updating lookup tables:', error);
    return res.status(500).send('An error occurred while updating lookup tables.');
  }
});

module.exports = router;
