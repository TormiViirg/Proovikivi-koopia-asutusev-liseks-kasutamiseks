const pool = require('../src/databasepool').pool;

module.exports = (req, res, next) => {
    if (!req.session.userId) {
        res.redirect('/login');
        return;
    }

    const userQuery = `
        SELECT 
            u.username, 
            u.email, 
            g.name AS gender, 
            u.birthdate, 
            u.institution_id, 
            ut.name AS user_type, 
            u.profile_picture,
            i.name AS institution_name
        FROM 
            user u
        LEFT JOIN 
            gender g ON u.gender_id = g.id
        LEFT JOIN 
            user_type ut ON u.user_type_id = ut.id
        LEFT JOIN
            institution i ON u.institution_id = i.id
        WHERE 
            u.id = ?
    `;

    pool.execute(userQuery, [req.session.userId], (err, userResults) => {
        if (err) {
            console.error('Error fetching user data:', err);
            res.status(500).send('Internal Server Error');
            return;
        }

        if (userResults.length === 0) {
            res.redirect('/login');
            return;
        }

        req.user = userResults[0];

        next();
    });
};
