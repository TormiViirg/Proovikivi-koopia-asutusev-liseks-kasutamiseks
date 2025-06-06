
const express = require('express');
const pool = require('../src/databasepool').pool;
const router = express.Router();

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

function applySearch(sql, countSql, searchQuery, filterQuery, searchOptionQuery, pageQuery, limit, offset) {

}


router.get('/', async (req, res) => {
  if (!req.session.userId) {
    res.redirect('/login');
    return;
  }

  let searchQuery       = req.query.search       || '';
  let filterQuery       = req.query.filters      || '';
  let searchOptionQuery = req.query.searchOption || 'All-Projects';
  let pageQuery         = parseInt(req.query.page) || 1;

  const limit  = 10;
  const offset = (pageQuery - 1) * limit;

  let sql      = '';
  let countSql = '';
  let values   = [];
  let values2  = [];

  switch (searchOptionQuery) {
    case 'Favourites':
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
        FROM project
        JOIN user ON project.user_id = user.id
        LEFT JOIN location ON project.location_id = location.id
        LEFT JOIN favourite_project 
          ON project.id = favourite_project.project_id 
          AND favourite_project.user_id = ?
        WHERE
          project.published = 1
          AND favourite_project.user_id = ?
      `;
      countSql = `
        SELECT COUNT(*) AS total_count
        FROM project
        JOIN user ON project.user_id = user.id
        LEFT JOIN location ON project.location_id = location.id
        LEFT JOIN favourite_project 
          ON project.id = favourite_project.project_id
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
        FROM project
        JOIN user ON project.user_id = user.id
        LEFT JOIN location ON project.location_id = location.id
        LEFT JOIN favourite_project 
          ON project.id = favourite_project.project_id 
          AND favourite_project.user_id = ?
        WHERE
          project.published = 1
          AND project.user_id = ?
      `;
      countSql = `
        SELECT COUNT(*) AS total_count
        FROM project
        JOIN user ON project.user_id = user.id
        LEFT JOIN location ON project.location_id = location.id
        WHERE
          project.published = 1
          AND project.user_id = ?
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
        FROM project
        JOIN user ON project.user_id = user.id
        LEFT JOIN location ON project.location_id = location.id
        LEFT JOIN favourite_project 
          ON project.id = favourite_project.project_id 
          AND favourite_project.user_id = ?
        WHERE
          project.published = 1
      `;
      countSql = `
        SELECT COUNT(*) AS total_count
        FROM project
        JOIN user ON project.user_id = user.id
        LEFT JOIN location ON project.location_id = location.id
        WHERE
          project.published = 1
      `;

      values.push(req.session.userId);
      break;
  }

  if (searchQuery) {
    const likePattern = `%${searchQuery}%`;
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

    values.push(likePattern, likePattern, likePattern, likePattern);
    values2.push(likePattern, likePattern, likePattern, likePattern);
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
        sql += `
          AND (project.end_date >= NOW() OR project.start_date > NOW())
          ORDER BY project.created_date DESC
        `;
        countSql += ' AND (project.end_date >= NOW() OR project.start_date > NOW())';
        break;
      case 'ended':
        sql += `
          AND project.end_date < NOW()
          ORDER BY project.created_date DESC
        `;
        countSql += ' AND project.end_date < NOW()';
        break;
      default:
        sql += ' ORDER BY project.created_date DESC';
        break;
    }
  } else {
    sql += ' ORDER BY project.created_date DESC';
  }

  sql += ` LIMIT ${limit} OFFSET ${offset}`;

  try {
    const [results] = await pool.execute(sql, values);

    results.forEach((project) => {
      project.start_date = formatDate(project.start_date);
      project.end_date   = formatDate(project.end_date);

      if (project.image) {
        project.image = project.image.toString('base64');
      }
      if (project.profile_picture) {
        project.profile_picture = project.profile_picture.toString('base64');
      }
    });

    const [countResults] = await pool.execute(countSql, values2);
    const totalCountRaw = countResults[0]?.total_count || 0;
    let totalPages = Math.ceil(totalCountRaw / limit);
    if (totalPages <= 0) {
      totalPages = 1;
    }
    if (pageQuery > totalPages) {
      pageQuery = 1;
    }

    res.render('projects', {
      projects: results,
      searchQuery,
      filterQuery,
      searchOptionQuery,
      pageQuery,
      totalCount: totalPages
    });
  } catch (err) {
    console.error('Error fetching project data:', err);
    res.status(500).send('Internal Server Error');
  }
});

router.post('/like', async (req, res) => {
  const userId    = req.session.userId;
  const projectId = req.body.projectId;
  const isLiked   = req.body.isLiked === 'true';

  if (!userId) {
    res.redirect('/login');
    return;
  }

  const insertOrDelete = isLiked
    ? 'INSERT INTO favourite_project (user_id, project_id) VALUES (?, ?)'
    : 'DELETE FROM favourite_project WHERE user_id = ? AND project_id = ?';

  const updateCount = isLiked
    ? 'UPDATE project SET favourite_count = favourite_count + 1 WHERE id = ?'
    : 'UPDATE project SET favourite_count = favourite_count - 1 WHERE id = ?';

  try {
    await pool.execute(insertOrDelete, [userId, projectId]);

    await pool.execute(updateCount, [projectId]);

    const [rows] = await pool.execute(
      'SELECT favourite_count FROM project WHERE id = ?',
      [projectId]
    );
    const updatedFavouriteCount = rows[0]?.favourite_count || 0;

    res.json({
      success: true,
      newFavouriteCount: updatedFavouriteCount,
      isFavourite: isLiked
    });
  } catch (err) {
    console.error('Error updating like status:', err);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

module.exports = router;
