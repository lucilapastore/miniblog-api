const express = require('express');
const router = express.Router();
const postsService = require('../services/posts.service');

// GET /posts - listar todos
router.get('/', async (req, res, next) => {
  try {
    const posts = await postsService.getAllPosts();
    res.json(posts);
  } catch (err) {
    next(err);
  }
});

// GET /posts/author/:authorId - posts de un author
// (va antes de /:id para que Express no lo confunda con esa ruta)
router.get('/author/:authorId', async (req, res, next) => {
  try {
    const posts = await postsService.getPostsByAuthor(req.params.authorId);
    res.json(posts);
  } catch (err) {
    next(err);
  }
});

// GET /posts/:id - detalle
router.get('/:id', async (req, res, next) => {
  try {
    const post = await postsService.getPostById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post no encontrado' });
    }
    res.json(post);
  } catch (err) {
    next(err);
  }
});

// POST /posts - crear
router.post('/', async (req, res, next) => {
  try {
    const { title, content, author_id, published } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'El campo title es obligatorio' });
    }
    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'El campo content es obligatorio' });
    }
    if (!author_id) {
      return res.status(400).json({ error: 'El campo author_id es obligatorio' });
    }
    const post = await postsService.createPost({ title, content, author_id, published });
    res.status(201).json(post);
  } catch (err) {
    if (err.code === '23503') {
      return res.status(400).json({ error: 'El author_id indicado no existe' });
    }
    next(err);
  }
});

// PUT /posts/:id - actualizar
router.put('/:id', async (req, res, next) => {
  try {
    const { title, content, author_id, published } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'El campo title es obligatorio' });
    }
    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'El campo content es obligatorio' });
    }
    if (!author_id) {
      return res.status(400).json({ error: 'El campo author_id es obligatorio' });
    }
    const post = await postsService.updatePost(req.params.id, { title, content, author_id, published });
    if (!post) {
      return res.status(404).json({ error: 'Post no encontrado' });
    }
    res.json(post);
  } catch (err) {
    if (err.code === '23503') {
      return res.status(400).json({ error: 'El author_id indicado no existe' });
    }
    next(err);
  }
});

// DELETE /posts/:id - eliminar
router.delete('/:id', async (req, res, next) => {
  try {
    const deleted = await postsService.deletePost(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Post no encontrado' });
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
