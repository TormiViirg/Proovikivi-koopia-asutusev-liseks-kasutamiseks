const express = require('express');
const pool = require('../src/databasepool').pool;
const router = express.Router();
const path = require('path');

function parseLines(text) {
  if (!text) return [];
  return text
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.length > 0);
}

router.get('/', (req, res) => {
  // If your view file is named "admin-panel.ejs" under views/,
  // this will render that template.
  res.render('admin-panel');
});

// POST /admin/panel
// This route processes the "Populate Lookup Tables" form. It reads each textarea field,
// splits its contents into non-empty lines, and inserts each line into the corresponding lookup table.
// If a row with the same name/title already exists, it will be skipped.
router.post('/', async (req, res) => {
  // Extract raw textarea values from the request body
  const {
    genders: rawGenders,
    userTypes: rawUserTypes,
    schoolSubjects: rawSchoolSubjects,
    globalGoals: rawGlobalGoals,
    proovikivid: rawProovikivid,
    locations: rawLocations
  } = req.body;

  // Parse each textarea into an array of non-empty, trimmed lines
  const genders = parseLines(rawGenders);
  const userTypes = parseLines(rawUserTypes);
  const schoolSubjects = parseLines(rawSchoolSubjects);
  const globalGoals = parseLines(rawGlobalGoals);
  const proovikivid = parseLines(rawProovikivid);
  const locations = parseLines(rawLocations);

  let connection;
  try {
    // Acquire a connection from the pool
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // 1) Insert into `gender` table
    for (const name of genders) {
      // Check if this gender already exists
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
      // If it exists, skip insertion
    }

    // 2) Insert into `user_type` table
    for (const name of userTypes) {
      // Check if this user type already exists
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

    // 3) Insert into `school_subject` table
    for (const name of schoolSubjects) {
      // Check if this subject already exists
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

    // 4) Insert into `global_goal` table
    // Note: `image` is a NOT NULL BLOB, so we insert an empty Buffer for the image column.
    for (const title of globalGoals) {
      // Check if this global goal title already exists
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

    // 5) Insert into `proovikivi` table
    // Note: columns are (title, image, goal); we insert an empty Buffer for image and NULL for goal.
    for (const title of proovikivid) {
      // Check if this project idea already exists
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

    // 6) Insert into `location` table
    for (const name of locations) {
      // Check if this location already exists
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

    // Commit all inserts
    await connection.commit();
    // Send a simple success response
    res.send('Lookup tables updated successfully.');
  } catch (error) {
    // Roll back if anything went wrong
    if (connection) {
      await connection.rollback();
    }
    console.error('Error updating lookup tables:', error);
    res.status(500).send('An error occurred while updating lookup tables.');
  } finally {
    // Release the connection back to the pool
    if (connection) {
      connection.release();
    }
  }
});

module.exports = router;