const express = require('express');
const pool = require('../src/databasepool').pool;
const router = express.Router();

router.get('/', (req, res) => {
    pool.execute('SELECT id, title FROM proovikivi', (err, results) => {
        if (err) {
            console.error('Error fetching proovikivi:', err);
            res.status(500).send('Internal Server Error');
            return;
        }
        res.render('mandatory-project-form', { proovikivi: results });
    });
});

router.post('/', (req, res) => {
    const { projectnameInput, proovikiviInput } = req.body;

    console.log('User submitted data:', { projectnameInput, proovikiviInput });

    if (!projectnameInput || !proovikiviInput) {
        const errorMessage2 = 'Kõik kohustuslikud väljad ei ole täidetud!';
        
        pool.execute('SELECT id, title FROM proovikivi', (err, results) => {
            if (err) {
                console.error('Error fetching proovikivi:', err);
                res.status(500).send('Internal Server Error');
                return;
            }
            res.render('project-form', { proovikivi: results, errorMessage2 });
        });
        return;
    }

    const handleProjectInsertion = () => {
        const sql = 'INSERT INTO project (title, proovikivi_id) VALUES (?, ?)';

        pool.getConnection((err, conn) => {
            if (err) {
                console.error('Error getting database connection:', err);
                res.status(500).send('Internal Server Error');
                return;
            }

            conn.execute(sql, [projectnameInput, proovikiviInput], (err, result) => {
                if (err) {
                    console.error('Error inserting project into database:', err);
                    res.status(500).send('Internal Server Error');
                    return;
                }
                res.render('project-form');
                conn.release();
            });
        });
    };

    handleProjectInsertion();
});

module.exports = router;
