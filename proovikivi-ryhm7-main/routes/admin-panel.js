const express = require('express');
const { pool } = require('../src/databasepool');
const router = express.Router();


function parseLines(text) {
  if (!text) return [];
  return text
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.length > 0);
}

router.get('/', async (req, res, next) => {
  try {
    const [genders] = await pool.query('SELECT name FROM gender ORDER BY id');
    const [userTypes] = await pool.query('SELECT name FROM user_type ORDER BY id');
    const [schoolSubjects] = await pool.query('SELECT name FROM school_subject ORDER BY id');
    const [globalGoals] = await pool.query('SELECT title FROM global_goal ORDER BY id');
    const [proovikivid] = await pool.query('SELECT title FROM proovikivi ORDER BY id');
    const [locations] = await pool.query('SELECT name FROM location ORDER BY id');
    const [institutions] = await pool.query('SELECT name FROM institution ORDER BY id');

    return res.render('admin-panel', {
      genders,        
      userTypes,       
      schoolSubjects,  
      globalGoals,     
      proovikivid,     
      locations,
      institutions        
    });
  } catch (err) {
    return next(err);
  }
});

router.post('/', async (req, res, next) => {
  const {
    genders: rawGenders,
    userTypes: rawUserTypes,
    schoolSubjects: rawSchoolSubjects,
    globalGoals: rawGlobalGoals,
    proovikivid: rawProovikivid,
    locations: rawLocations,
    institutions: rawInstitutions
  } = req.body;

  const genders = parseLines(rawGenders);
  const userTypes = parseLines(rawUserTypes);
  const schoolSubjects = parseLines(rawSchoolSubjects);
  const globalGoals = parseLines(rawGlobalGoals);
  const proovikivid = parseLines(rawProovikivid);
  const locations = parseLines(rawLocations);
  const institutions = parseLines(rawInstitutions);

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

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

    for (const name of institutions) {
      const [rows] = await connection.query(
        'SELECT id FROM institution WHERE name = ?',
        [name]
      );
      if (rows.length === 0) {
        await connection.query(
          'INSERT INTO institution (name) VALUES (?)',
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
