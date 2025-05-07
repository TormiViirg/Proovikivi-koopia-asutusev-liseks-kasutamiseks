const express = require('express');
const router = express.Router();
const pool = require('../src/databasepool').pool;
const multer = require('multer');
const Buffer = require('buffer').Buffer;

const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 4 * 1024 * 1024, 
        fieldSize: 2 * 1024 * 1024,
    }
});

function isAuthenticated(req, res, next) {
    if (req.session.userId) {
        next();
    } else {
        res.redirect('/login');
    }
}

router.get('/', isAuthenticated, async (req, res) => {
    try {
        const [locations] = await pool.promise().query('SELECT id, name FROM location');
        const [globalGoals] = await pool.promise().query('SELECT id, title FROM global_goal');
        const [institutions] = await pool.promise().query('SELECT id, name FROM institution');
        const [schoolSubjects] = await pool.promise().query('SELECT id, name FROM school_subject');
        const [proovikivi] = await pool.promise().query('SELECT id, title FROM proovikivi');

        res.render('project-form', {
            locations,
            globalGoals,
            institutions,
            schoolSubjects,
            proovikivi
        });
    } catch (err) {
        console.error('Error fetching data:', err);
        res.status(500).send('Internal Server Error');
    }
});

router.post('/', upload.single('photoInput'), isAuthenticated, async (req, res) => {
    const {
        projectnameInput, proovikiviInput, supervisorInput, image_description,
        start_date, end_date, location_specify, team_member,
        tag, problem_description, solution_idea, project_plan, results_conclusion,
        contact, web_link, youtube_link, croppedImage
    } = req.body;

    const global_goal_ids = req.body.global_goal_id; // global goal ids array
    const school_subject_ids = req.body.school_subject_id; // school subject IDs array 
    const userId = req.session.userId;

    let { institutionsInput, location_id } = req.body;
    institutionsInput = institutionsInput || null;
    location_id = location_id || null;

    // Validate the size of the uploaded image file
    if (req.file && req.file.size > 4 * 1024 * 1024) { // 5MB limit for image
        return res.status(400).send('Image size exceeds the limit of 5MB');
    }

    // Decode base64 image if available and validate its size
    let imageBuffer = null;
    if (croppedImage) {
        const base64Str = croppedImage.split(",")[1];
        const buffer = Buffer.from(base64Str, 'base64');
        if (buffer.length > 4 * 1024 * 1024) { // 5MB limit for base64 image
            return res.status(400).send('Base64 image size exceeds the limit of 5MB');
        }
        imageBuffer = buffer;
    }

    // Check for required fields
    if (!projectnameInput || !proovikiviInput || !supervisorInput) {
        return res.status(400).send('All required fields must be filled out');
    }

    try {
        let institutionId = null;

        // fetch institution ID if provided
        if (institutionsInput) {
            const [results] = await pool.promise().query('SELECT id FROM institution WHERE name = ?', [institutionsInput]);
            if (results.length === 0) {
                throw new Error('Institution not found');
            }
            institutionId = results[0].id;
        }

        // handle empty start_date and end_date
        const startDate = start_date ? start_date : null;
        const endDate = end_date ? end_date : null;

        const sql = `INSERT INTO project (user_id, title, proovikivi_id, supervisor, image, image_description, start_date, end_date, location_id, location_specify, team_member, institution_id, tag, problem_description, solution_idea, project_plan, results_conclusions, contact, web_link, youtube_link, published) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`;

        const [projectResult] = await pool.promise().query(sql, [
            userId, projectnameInput, proovikiviInput, supervisorInput, imageBuffer, image_description,
            startDate, endDate, location_id, location_specify, team_member, institutionId,
            tag, problem_description, solution_idea, project_plan, results_conclusion, contact, web_link, youtube_link
        ]);

        const projectId = projectResult.insertId;

        // insert global goals
        if (global_goal_ids && global_goal_ids.length > 0) {
            const globalGoalsSql = 'INSERT INTO project_global_goal (project_id, global_goal_id) VALUES ?';
            const globalGoalsValues = global_goal_ids.map(goalId => [projectId, goalId]);

            await pool.promise().query(globalGoalsSql, [globalGoalsValues]);
        }

        // insert school subjects
        if (school_subject_ids && school_subject_ids.length > 0) {
            const schoolSubjectsSql = 'INSERT INTO project_school_subject (project_id, school_subject_id) VALUES ?';
            const schoolSubjectsValues = school_subject_ids.map(subjectId => [projectId, subjectId]);

            await pool.promise().query(schoolSubjectsSql, [schoolSubjectsValues]);
        }

        res.render('projectCreated');

    } catch (err) {
        console.error('Error inserting project:', err);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
