const express = require('express');
const router = express.Router();
const pool = require('../src/databasepool').pool;
const multer = require('multer');
const upload = multer();

function isAuthenticated(req, res, next) {
  if (req.session.userId) {
    next();
  } else {
    res.redirect('/login');
  }
}

async function isAuthorized(req, res, next) {
  const projectId = req.params.id;
  const userId = req.session.userId;

  try {
    const [projectRows] = await pool
      .promise()
      .query('SELECT user_id FROM project WHERE id = ?', [projectId]);
    if (projectRows.length === 0) {
      return res.status(404).send('Project not found');
    }

    const projectUserId = projectRows[0].user_id;
    if (userId !== projectUserId) {
      return res.status(403).send('Unauthorized');
    }

    next();
  } catch (err) {
    console.error('Error checking authorization:', err);
    res.status(500).send('Internal Server Error');
  }
}

function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  let month = '' + (d.getMonth() + 1);
  let day = '' + d.getDate();
  const year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
}

router.get('/:id', isAuthenticated, isAuthorized, async (req, res) => {
  const projectId = req.params.id;

  try {
    const [
      [projectRows],
      [proovikivi],
      [locations],
      [institutions],
      [schoolSubjects],
      [globalGoals],
      [projectGlobalGoalsRows],
      [projectSchoolSubjectsRows],
    ] = await Promise.all([
      pool.promise().query('SELECT * FROM project WHERE id = ?', [projectId]),
      pool.promise().query('SELECT * FROM proovikivi'),
      pool.promise().query('SELECT * FROM location'),
      pool.promise().query('SELECT * FROM institution'),
      pool.promise().query('SELECT * FROM school_subject'),
      pool.promise().query('SELECT * FROM global_goal'),
      pool
        .promise()
        .query(
          'SELECT global_goal_id FROM project_global_goal WHERE project_id = ?',
          [projectId]
        ),
      pool
        .promise()
        .query(
          'SELECT school_subject_id FROM project_school_subject WHERE project_id = ?',
          [projectId]
        ),
    ]);

    const project = projectRows[0];
    const projectGlobalGoals = projectGlobalGoalsRows.map((r) =>
      r.global_goal_id.toString()
    );
    const projectSchoolSubjects = projectSchoolSubjectsRows.map((r) =>
      r.school_subject_id.toString()
    );

    let relatedInstitution = null;
    if (project.institution_id) {
      const [institutionRows] = await pool
        .promise()
        .query('SELECT * FROM institution WHERE id = ?', [project.institution_id]);
      relatedInstitution = institutionRows[0] || null;
    }

    res.render('project-update', {
      project: {
        ...project,
        globalGoals: projectGlobalGoals,
        schoolSubjects: projectSchoolSubjects,
        relatedInstitution,
      },
      proovikivi,
      locations,
      institutions,
      schoolSubjects,
      globalGoals,
      formatDate,
    });
  } catch (err) {
    console.error('Error fetching project data:', err);
    res.status(500).send('Internal Server Error');
  }
});

router.post('/:id', isAuthenticated, isAuthorized, upload.none(), async (req, res) => {
  const projectId = req.params.id;
  const {
    title,
    proovikivi,
    supervisor,
    start_date,
    end_date,
    location,
    locationSpecify,
    teamMember,
    relatedInstitution,
    globalGoals,
    schoolSubjects,
    tag,
    problemDescription,
    solutionIdea,
    projectPlan,
    resultsConclusions,
    contact,
    webLink,
    youtubeLink,
  } = req.body;

  try {
    const updateQuery = `
      UPDATE project 
      SET 
        title = ?, 
        proovikivi_id = ?, 
        supervisor = ?, 
        start_date = ?, 
        end_date = ?, 
        location_id = ?, 
        location_specify = ?, 
        team_member = ?, 
        institution_id = ?, 
        tag = ?, 
        problem_description = ?, 
        solution_idea = ?, 
        project_plan = ?, 
        results_conclusions = ?, 
        contact = ?, 
        web_link = ?, 
        youtube_link = ? 
      WHERE id = ?
    `;
    const updateValues = [
      title,
      proovikivi,
      supervisor,
      start_date || null,
      end_date || null,
      location || null,
      locationSpecify,
      teamMember,
      relatedInstitution || null,
      tag,
      problemDescription,
      solutionIdea,
      projectPlan,
      resultsConclusions,
      contact,
      webLink,
      youtubeLink,
      projectId,
    ];
    await pool.promise().query(updateQuery, updateValues);

    await pool
      .promise()
      .query('DELETE FROM project_global_goal WHERE project_id = ?', [projectId]);

    if (globalGoals) {
      const goalIds = Array.isArray(globalGoals) ? globalGoals : [globalGoals];

      const placeholders = goalIds.map(() => '(?, ?)').join(', ');
      const params = goalIds.flatMap((gId) => [projectId, gId]);
      const insertGGSql = `
        INSERT INTO project_global_goal (project_id, global_goal_id)
        VALUES ${placeholders}
      `;
      await pool.promise().query(insertGGSql, params);
    }

    await pool
      .promise()
      .query('DELETE FROM project_school_subject WHERE project_id = ?', [projectId]);

    if (schoolSubjects) {
      const subjectIds = Array.isArray(schoolSubjects) ? schoolSubjects : [schoolSubjects];
      const placeholders = subjectIds.map(() => '(?, ?)').join(', ');
      const params = subjectIds.flatMap((sId) => [projectId, sId]);
      const insertSSSql = `
        INSERT INTO project_school_subject (project_id, school_subject_id)
        VALUES ${placeholders}
      `;
      await pool.promise().query(insertSSSql, params);
    }

    res.redirect('/projects');
  } catch (err) {
    console.error('Error updating project:', err);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
