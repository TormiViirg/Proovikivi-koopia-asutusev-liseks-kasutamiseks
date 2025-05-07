const pool = require('../src/databasepool').pool;

module.exports = (req, res, next) => {
    if (!req.session.userId) {
        res.redirect('/login');
        return;
    }

    const query = `
        SELECT 
            u.username, 
            u.email, 
            g.name AS gender, 
            u.birthdate, 
            u.related_institution, 
            ut.name AS user_type, 
            u.profile_picture 
        FROM 
            user u
        LEFT JOIN 
            gender g ON u.gender_id = g.id
        LEFT JOIN 
            user_type ut ON u.user_type_id = ut.id
        WHERE 
            u.id = ?
    `;

    pool.execute(query, [req.session.userId], (err, results) => {
        if (err) {
            console.error('Error fetching user data:', err);
            res.status(500).send('Internal Server Error');
            return;
        }

        if (results.length === 0) {
            res.redirect('/login');
            return;
        }

        req.user = results[0];
        next();
    });
};
