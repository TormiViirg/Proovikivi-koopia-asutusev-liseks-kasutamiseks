const express = require('express');
const router = express.Router();
const pool = require('../src/databasepool').pool;
const multer = require('multer');
const { Buffer } = require('buffer');

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 4 * 1024 * 1024,  
    fieldSize: 2 * 1024 * 1024,
  },
});

function isAuthenticated(req, res, next) {
  if (req.session.userId) {
    next();
  } else {
    res.redirect('/login');
  }
}

function formatDate(dateString) {
  if (!dateString) {
    return '';
  }
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

router.get('/', isAuthenticated, async (req, res) => {
  try {
    const [
      [locations],
      [globalGoals],
      [institutions],
      [schoolSubjects],
      [proovikivi],
    ] = await Promise.all([
      pool.execute('SELECT id, name FROM location'),
      pool.execute('SELECT id, title FROM global_goal'),
      pool.execute('SELECT id, name FROM institution'),
      pool.execute('SELECT id, name FROM school_subject'),
      pool.execute('SELECT id, title FROM proovikivi'),
    ]);

    res.render('project-form', {
      locations,
      globalGoals,
      institutions,
      schoolSubjects,
      proovikivi,
    });
  } catch (err) {
    console.error('Error fetching data:', err);
    res.status(500).send('Internal Server Error');
  }
});

router.post(
  '/',
  upload.single('photoInput'),
  isAuthenticated,
  async (req, res) => {
    const {
      projectnameInput,
      proovikiviInput,
      supervisorInput,
      image_description,
      start_date,
      end_date,
      location_specify,
      team_member,
      tag,
      problem_description,
      solution_idea,
      project_plan,
      results_conclusion,
      contact,
      web_link,
      youtube_link,
      croppedImage,
    } = req.body;

    const global_goal_ids = req.body.global_goal_id;       // may be array or single
    const school_subject_ids = req.body.school_subject_id;  // may be array or single
    const userId = req.session.userId;

    let { institutionsInput, location_id } = req.body;
    institutionsInput = institutionsInput || null;
    location_id = location_id || null;

    if (req.file && req.file.size > 4 * 1024 * 1024) {
      return res
        .status(400)
        .send('Image size exceeds the limit of 4 MiB');
    }

    let imageBuffer = null;
    if (croppedImage) {
      const base64Str = croppedImage.split(',')[1] || '';
      const buffer = Buffer.from(base64Str, 'base64');
      if (buffer.length > 4 * 1024 * 1024) {
        return res
          .status(400)
          .send('Base64 image size exceeds the limit of 4 MiB');
      }
      imageBuffer = buffer;
    }

    if (!projectnameInput || !proovikiviInput || !supervisorInput) {
      return res
        .status(400)
        .send('All required fields must be filled out');
    }

    try {
      let institutionId = null;
      if (institutionsInput) {
        const [rows] = await pool.execute(
          'SELECT id FROM institution WHERE name = ?',
          [institutionsInput]
        );
        if (rows.length === 0) {
          throw new Error('Institution not found');
        }
        institutionId = rows[0].id;
      }

      const startDate = start_date || null;
      const endDate = end_date || null;

      const sql = `
        INSERT INTO project (
          user_id, title, proovikivi_id, supervisor,
          image, image_description,
          start_date, end_date,
          location_id, location_specify, team_member,
          institution_id, tag, problem_description,
          solution_idea, project_plan,
          results_conclusions, contact,
          web_link, youtube_link,
          published
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
      `;
      const params = [
        userId,
        projectnameInput,
        proovikiviInput,
        supervisorInput,
        imageBuffer,
        image_description,
        startDate,
        endDate,
        location_id,
        location_specify,
        team_member,
        institutionId,
        tag,
        problem_description,
        solution_idea,
        project_plan,
        results_conclusion,
        contact,
        web_link,
        youtube_link,
      ];

      const [projectResult] = await pool.execute(sql, params);
      const projectId = projectResult.insertId;

      if (global_goal_ids) {
        const goalArray = Array.isArray(global_goal_ids)
          ? global_goal_ids
          : [global_goal_ids];
        if (goalArray.length > 0) {
          const placeholders = goalArray.map(() => '(?, ?)').join(', ');
          const flatParams = goalArray.flatMap((gId) => [
            projectId,
            gId,
          ]);
          const insertGGSql = `
            INSERT INTO project_global_goal (project_id, global_goal_id)
            VALUES ${placeholders}
          `;
          await pool.execute(insertGGSql, flatParams);
        }
      }

      if (school_subject_ids) {
        const subjArray = Array.isArray(school_subject_ids)
          ? school_subject_ids
          : [school_subject_ids];
        if (subjArray.length > 0) {
          const placeholders = subjArray.map(() => '(?, ?)').join(', ');
          const flatParams = subjArray.flatMap((sId) => [
            projectId,
            sId,
          ]);
          const insertSSSql = `
            INSERT INTO project_school_subject (
              project_id, school_subject_id
            ) VALUES ${placeholders}
          `;
          await pool.execute(insertSSSql, flatParams);
        }
      }

      res.render('projectCreated');
    } catch (err) {
      console.error('Error inserting project:', err);
      res.status(500).send('Internal Server Error');
    }
  }
);

module.exports = router;
