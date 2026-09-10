const pool = require('../db/pool');

async function getAllPosts() {
  const result = await pool.query(
    'SELECT id, title, content, author_id, published, created_at FROM posts ORDER BY id'
  );
  return result.rows;
}

async function getPostById(id) {
  const result = await pool.query(
    'SELECT id, title, content, author_id, published, created_at FROM posts WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
}

async function getPostsByAuthor(authorId) {
  const result = await pool.query(
    `SELECT posts.id, posts.title, posts.content, posts.published, posts.created_at,
            authors.id AS author_id, authors.name AS author_name, authors.email AS author_email
     FROM posts
     JOIN authors ON posts.author_id = authors.id
     WHERE authors.id = $1
     ORDER BY posts.id`,
    [authorId]
  );
  return result.rows;
}

async function createPost({ title, content, author_id, published }) {
  const result = await pool.query(
    `INSERT INTO posts (title, content, author_id, published)
     VALUES ($1, $2, $3, $4)
     RETURNING id, title, content, author_id, published, created_at`,
    [title, content, author_id, published || false]
  );
  return result.rows[0];
}

async function updatePost(id, { title, content, author_id, published }) {
  const result = await pool.query(
    `UPDATE posts
     SET title = $1, content = $2, author_id = $3, published = $4
     WHERE id = $5
     RETURNING id, title, content, author_id, published, created_at`,
    [title, content, author_id, published, id]
  );
  return result.rows[0] || null;
}

async function deletePost(id) {
  const result = await pool.query(
    'DELETE FROM posts WHERE id = $1 RETURNING id',
    [id]
  );
  return result.rowCount > 0;
}

module.exports = {
  getAllPosts,
  getPostById,
  getPostsByAuthor,
  createPost,
  updatePost,
  deletePost,
};
