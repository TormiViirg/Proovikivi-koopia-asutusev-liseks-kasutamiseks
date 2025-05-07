// Modules and Routes

const express = require('express');
const pool = require('../src/databasepool').pool;
const router = express.Router();

// Format dates into dd.mm.yyyy, set NULL dates to None.

function formatDate(dateString) {
    if (!dateString || dateString === '1970-01-01') {
        return "None";
    }

    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}.${month}.${year}`;
}

function applySearch(sql, countSql, searchQuery, filterQuery, searchOptionQuery, pageQuery, limit, offset){

};

// Projekti andmete küsimine andmebaasist

router.get('/', (req, res) => {

    if (!req.session.userId) {
        res.redirect('/login');
        return;
    }

    let searchQuery = req.query.search || ''; 
    let filterQuery = req.query.filters || '';
    let searchOptionQuery = req.query.searchOption || 'All-Projects';
    let pageQuery = parseInt(req.query.page) || 1;

    let limit = 10;
    let offset = (pageQuery - 1) * limit;
    let sql = '';
    let countSql = '';
    let values = [];
    let values2 = [];

    if (searchOptionQuery) {
        switch (searchOptionQuery) {

            case 'Favourites':

                sql += ` 
                SELECT 
                    project.id, 
                    user.username, 
                    user.profile_picture, 
                    project.title, 
                    project.favourite_count, 
                    COALESCE(location.name, 'Asukoht puudub') AS location_name, 
                    project.start_date, 
                    project.end_date, 
                    project.image,
                    CASE WHEN favourite_project.user_id IS NOT NULL THEN 1 ELSE 0 END AS is_favourite
                FROM 
                    project 
                JOIN 
                    user ON project.user_id = user.id 
                LEFT JOIN 
                    location ON project.location_id = location.id 
                LEFT JOIN 
                    favourite_project ON project.id = favourite_project.project_id AND favourite_project.user_id = ?
                WHERE 
                    project.published = 1
                    AND favourite_project.user_id = ?
                `;

                countSql = `
                SELECT 
                    COUNT(*) AS total_count 
                FROM 
                    project 
                JOIN 
                    user ON project.user_id = user.id 
                LEFT JOIN 
                    location ON project.location_id = location.id
                LEFT JOIN 
                    favourite_project ON project.id = favourite_project.project_id
                WHERE 
                    project.published = 1
                    AND favourite_project.user_id = ?
                `;

                values.push(req.session.userId, req.session.userId);
                values2.push(req.session.userId);

                break;

            case 'My-Projects':

                sql = `
                SELECT 
                    project.id, 
                    user.username, 
                    user.profile_picture, 
                    project.title, 
                    project.favourite_count, 
                    COALESCE(location.name, 'Asukoht puudub') AS location_name, 
                    project.start_date, 
                    project.end_date, 
                    project.image,
                    CASE WHEN favourite_project.user_id IS NOT NULL THEN 1 ELSE 0 END AS is_favourite
                FROM 
                    project 
                JOIN 
                    user ON project.user_id = user.id 
                LEFT JOIN 
                    location ON project.location_id = location.id 
                LEFT JOIN 
                    favourite_project ON project.id = favourite_project.project_id AND favourite_project.user_id = ?
                WHERE 
                    project.published = 1 AND project.user_id = ?
            `;
        
                countSql = `
                SELECT 
                    COUNT(*) AS total_count 
                FROM 
                    project 
                JOIN 
                    user ON project.user_id = user.id 
                LEFT JOIN 
                    location ON project.location_id = location.id 
                WHERE 
                    project.published = 1 AND project.user_id = ?
            `;

                values.push(req.session.userId, req.session.userId);
                values2.push(req.session.userId);

                break;

            default: 

                sql = `
                SELECT 
                    project.id, 
                    user.username, 
                    user.profile_picture, 
                    project.title, 
                    project.favourite_count, 
                    COALESCE(location.name, 'Asukoht puudub') AS location_name, 
                    project.start_date, 
                    project.end_date, 
                    project.image, 
                    CASE WHEN favourite_project.user_id IS NOT NULL THEN 1 ELSE 0 END AS is_favourite
                FROM 
                    project 
                JOIN 
                    user ON project.user_id = user.id 
                LEFT JOIN 
                    location ON project.location_id = location.id 
                LEFT JOIN 
                    favourite_project ON project.id = favourite_project.project_id AND favourite_project.user_id = ?
                WHERE 
                    project.published = 1
            `;
        
                countSql = `
                SELECT 
                    COUNT(*) AS total_count 
                FROM 
                    project 
                JOIN 
                    user ON project.user_id = user.id 
                LEFT JOIN 
                    location ON project.location_id = location.id 
                WHERE 
                    project.published = 1
            `;

                values.push(req.session.userId);

                break;
                
        }
    } else {

        sql = `
        SELECT 
            project.id, 
            user.username, 
            user.profile_picture, 
            project.title, 
            project.favourite_count, 
            COALESCE(location.name, 'Asukoht puudub') AS location_name, 
            project.start_date, 
            project.end_date, 
            project.image,
            CASE WHEN favourite_project.user_id IS NOT NULL THEN 1 ELSE 0 END AS is_favourite
        FROM 
            project 
        JOIN 
            user ON project.user_id = user.id 
        LEFT JOIN 
            location ON project.location_id = location.id
        LEFT JOIN 
            favourite_project ON project.id = favourite_project.project_id AND favourite_project.user_id = ? 
        WHERE 
            project.published = 1
    `;

        countSql = `
        SELECT 
            COUNT(*) AS total_count 
        FROM 
            project 
        JOIN 
            user ON project.user_id = user.id 
        LEFT JOIN 
            location ON project.location_id = location.id 
        WHERE 
            project.published = 1
    `;

        values.push(req.session.userId);

    }

    if (searchQuery) {
        sql += ` 
        AND (
            LOWER(project.title) LIKE LOWER(?)
            OR LOWER(project.problem_description) LIKE LOWER(?)
            OR LOWER(user.username) LIKE LOWER(?)
            OR LOWER(location.name) LIKE LOWER(?)
        )
        `;
        countSql += ` 
        AND (
            LOWER(project.title) LIKE LOWER(?)
            OR LOWER(project.problem_description) LIKE LOWER(?)
            OR LOWER(user.username) LIKE LOWER(?)
            OR LOWER(location.name) LIKE LOWER(?)
        )
        `;
        values.push(`%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`);
        values2.push(`%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`);
    }

    if (filterQuery) {
        switch (filterQuery) {
            case 'newest':
                sql += ' ORDER BY project.created_date DESC';
                break;
            case 'oldest':
                sql += ' ORDER BY project.created_date ASC';
                break;
            case 'popular':
                sql += ' ORDER BY project.favourite_count DESC';
                break;
            case 'ongoing':
                sql += ' AND (project.end_date >= NOW() OR project.start_date > NOW()) ORDER BY project.created_date DESC';
                countSql += ' AND (project.end_date >= NOW() OR project.start_date > NOW())';
                break;
            case 'ended':
                sql += ' AND project.end_date < NOW() ORDER BY project.created_date DESC';
                countSql += ' AND project.end_date < NOW()';
                break;
        }
    } else {
        sql += ' ORDER BY project.created_date DESC';
    }

    sql += ` LIMIT ${limit} OFFSET ${offset}`;

    pool.execute(sql, values, (err, results) => {
        if (err) {
            console.error('Error fetching project data:', err);
            res.status(500).send('Internal Server Error');
            return;
        }
    
        // Format dates and convert images to base64
        results.forEach(project => {
            project.start_date = formatDate(project.start_date);
            project.end_date = formatDate(project.end_date);
    
            if (project.image) {
                project.image = project.image.toString('base64');
            }
            if (project.profile_picture) {
                project.profile_picture = project.profile_picture.toString('base64');
            }
        });
    
        // Execute countSql to get total count
        pool.execute(countSql, values2, (err, countResults) => {
            if (err) {
                console.error('Error fetching total count:', err);
                res.status(500).send('Internal Server Error');
                return;
            }
    
            // Extract total count from countResults
            const totalCount = countResults[0].total_count;
            var roundedCount = Math.ceil(totalCount / limit);
            if (roundedCount <= 0){
                roundedCount = 1;
            }

            if (pageQuery > roundedCount){
                pageQuery = 1;
            }
    
            // Render the projects page with results and metadata
            res.render('projects', {
                projects: results,
                searchQuery: searchQuery,
                filterQuery: filterQuery,
                searchOptionQuery: searchOptionQuery,
                pageQuery: pageQuery,
                totalCount: roundedCount // Pass totalCount to your template
            });
        });
    });
});

router.post('/like', (req, res) => {
    const userId = req.session.userId;
    const projectId = req.body.projectId;
    const isLiked = req.body.isLiked === 'true';

    if (!req.session.userId) {
        res.redirect('/login');
        return;
    }

    const updateLikeStatus = isLiked ?
        `INSERT INTO favourite_project (user_id, project_id) VALUES (?, ?)` :
        `DELETE FROM favourite_project WHERE user_id = ? AND project_id = ?`;

    pool.execute(updateLikeStatus, [userId, projectId], (err, results) => {
        if (err) {
            console.error('Error updating like status:', err);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
            return;
        }

        const updateCount = isLiked ?
            `UPDATE project SET favourite_count = favourite_count + 1 WHERE id = ?` :
            `UPDATE project SET favourite_count = favourite_count - 1 WHERE id = ?`;

        pool.execute(updateCount, [projectId], (err, results) => {
            if (err) {
                console.error('Error updating favourite count:', err);
                res.status(500).json({ success: false, message: 'Internal Server Error' });
                return;
            }

            // Fetch the updated favourite count
            pool.execute('SELECT favourite_count FROM project WHERE id = ?', [projectId], (err, results) => {
                if (err) {
                    console.error('Error fetching updated favourite count:', err);
                    res.status(500).json({ success: false, message: 'Internal Server Error' });
                    return;
                }

                const updatedFavouriteCount = results[0].favourite_count;
                res.json({
                    success: true,
                    newFavouriteCount: updatedFavouriteCount,
                    isFavourite: isLiked
                });
            });
        });
    });
});

module.exports = router;
