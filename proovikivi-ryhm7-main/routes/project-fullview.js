const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/projectdata');
const pool = require('../src/databasepool').pool;
const path = require('path');


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

router.get('/:id', authMiddleware, (req, res) => {
    const projectId = req.params.id;
    const userId = req.session.userId;

    const projectQuery = `
        SELECT
            p.id,
            p.user_id,
            p.title,
            pr.title AS proovikivi_title,
            pr.image AS proovikivi_image,
            pr.goal AS proovikivi_goal,
            p.supervisor,
            p.image AS image_blob,
            p.image_description,
            p.start_date,
            p.end_date,
            l.name AS location_name,
            p.location_specify,
            p.team_member,
            i.name AS related_institution,
            GROUP_CONCAT(DISTINCT ss.name SEPARATOR ', ') AS school_subject_names,
            GROUP_CONCAT(DISTINCT gg.title SEPARATOR ', ') AS global_goal_titles,
            p.tag,
            p.problem_description,
            p.solution_idea,
            p.project_plan,
            p.results_conclusions,
            p.contact,
            p.web_link,
            p.youtube_link,
            p.published,
            p.flagged,
            p.favourite_count,
            p.created_date,
            u.username AS creator_name,
            u.email AS creator_email
        FROM
            project p
        LEFT JOIN
            proovikivi pr ON p.proovikivi_id = pr.id
        LEFT JOIN
            location l ON p.location_id = l.id
        LEFT JOIN
            institution i ON p.institution_id = i.id
        LEFT JOIN
            project_school_subject pss ON p.id = pss.project_id
        LEFT JOIN
            school_subject ss ON pss.school_subject_id = ss.id
        LEFT JOIN
            project_global_goal pgg ON p.id = pgg.project_id
        LEFT JOIN
            global_goal gg ON pgg.global_goal_id = gg.id
        LEFT JOIN
            user u ON p.user_id = u.id
        WHERE
            p.id = ?
        GROUP BY
            p.id
    `;


    pool.execute(projectQuery, [projectId], (err, results) => {
        if (err) {
            console.error('Error fetching project data:', err);
            res.status(500).send('Internal Server Error');
            return;
        }

        if (results.length === 0) {
            res.status(404).send('Project not found');
            return;
        }

        const project = results[0];
        project.data = results;

        if (project.image_blob) {
            project.image_base64 = Buffer.from(project.image_blob, 'binary').toString('base64');
        }

        // Convert proovikivi_image to base64 if it exists and is not null
        if (project.proovikivi_image) {
            project.proovikivi_image_base64 = Buffer.from(project.proovikivi_image, 'binary').toString('base64');
        }

        if (project.tag) {
            project.tags = project.tag.split(',').map(tag => tag.trim());
        } else {
            project.tags = [];
        }

        project.start_date = formatDate(project.start_date);
        project.end_date = formatDate(project.end_date);
        project.created_date = formatDate(project.created_date);

        res.render('project-fullview', { project, userId });
    });
});

router.get('/project-full-functions.js', (req, res) => {
    res.type('text/javascript');
    res.sendFile('project-full-functions.js', { root: path.join(__dirname, '../script/') });
});

router.get('/like/status/:id', (req, res) => {
    const projectId = req.params.id;
    const userId = req.session.userId;

    const query = `
        SELECT COUNT(*) AS likeCount, EXISTS (
            SELECT 1 FROM favourite_project WHERE user_id = ? AND project_id = ?
        ) AS liked
        FROM project WHERE id = ?
    `;

    pool.execute(query, [userId, projectId, projectId], (err, results) => {
        if (err) {
            console.error('Error fetching like status:', err);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
            return;
        }

        if (results.length === 0) {
            res.status(404).json({ success: false, message: 'Project not found' });
            return;
        }

        const { likeCount, liked } = results[0];
        res.json({ likeCount, liked });
    });
});


router.post('/like/:id', (req, res) => {
    const projectId = req.params.id;
    const userId = req.session.userId; 

    // Check if the user has already liked the project
    const checkQuery = `
        SELECT * FROM favourite_project
        WHERE user_id = ? AND project_id = ?
    `;

    pool.execute(checkQuery, [userId, projectId], (err, results) => {
        if (err) {
            console.error('Error checking like status:', err);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
            return;
        }

        if (results.length > 0) {
            // User has already liked the project, so unlike it
            const deleteQuery = `
                DELETE FROM favourite_project
                WHERE user_id = ? AND project_id = ?
            `;

            pool.execute(deleteQuery, [userId, projectId], (err, _) => {
                if (err) {
                    console.error('Error unliking project:', err);
                    res.status(500).json({ success: false, message: 'Internal Server Error' });
                    return;
                }

                // Decrease favourite_count in the project table
                const decreaseCountQuery = `
                    UPDATE project
                    SET favourite_count = favourite_count - 1
                    WHERE id = ?
                `;
                pool.execute(decreaseCountQuery, [projectId], (err, _) => {
                    if (err) {
                        console.error('Error updating favourite_count:', err);
                        res.status(500).json({ success: false, message: 'Internal Server Error' });
                        return;
                    }
                    res.json({ success: true, message: 'Project unliked' });
                });
            });
        } else {
            // User has not liked the project, so like it
            const insertQuery = `
                INSERT INTO favourite_project (user_id, project_id)
                VALUES (?, ?)
            `;

            pool.execute(insertQuery, [userId, projectId], (err, _) => {
                if (err) {
                    console.error('Error liking project:', err);
                    res.status(500).json({ success: false, message: 'Internal Server Error' });
                    return;
                }

                // Increase favourite_count in the project table
                const increaseCountQuery = `
                    UPDATE project
                    SET favourite_count = favourite_count + 1
                    WHERE id = ?
                `;
                pool.execute(increaseCountQuery, [projectId], (err, _) => {
                    if (err) {
                        console.error('Error updating favourite_count:', err);
                        res.status(500).json({ success: false, message: 'Internal Server Error' });
                        return;
                    }
                    res.json({ success: true, message: 'Project liked' });
                });
            });
        }
    });
});


module.exports = router;