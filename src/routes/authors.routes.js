const express = require('express');
const router = express.Router();
const authorsService = require('../services/authors.service');

// GET /authors - listar todos
router.get('/', async (req, res, next) => {
  try {
    const authors = await authorsService.getAllAuthors();
    res.json(authors);
  } catch (err) {
    next(err);
  }
});

// GET /authors/:id - detalle
router.get('/:id', async (req, res, next) => {
  try {
    const author = await authorsService.getAuthorById(req.params.id);
    if (!author) {
      return res.status(404).json({ error: 'Author no encontrado' });
    }
    res.json(author);
  } catch (err) {
    next(err);
  }
});

// POST /authors - crear
router.post('/', async (req, res, next) => {
  try {
    const { name, email, bio } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'El campo name es obligatorio' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'El campo email es obligatorio' });
    }
    const author = await authorsService.createAuthor({ name, email, bio });
    res.status(201).json(author);
  } catch (err) {
    if (err.code === '23505') {
      // Violación de constraint UNIQUE (email duplicado)
      return res.status(400).json({ error: 'Ya existe un author con ese email' });
    }
    next(err);
  }
});

// PUT /authors/:id - actualizar
router.put('/:id', async (req, res, next) => {
  try {
    const { name, email, bio } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'El campo name es obligatorio' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'El campo email es obligatorio' });
    }
    const author = await authorsService.updateAuthor(req.params.id, { name, email, bio });
    if (!author) {
      return res.status(404).json({ error: 'Author no encontrado' });
    }
    res.json(author);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Ya existe un author con ese email' });
    }
    next(err);
  }
});

// DELETE /authors/:id - eliminar
router.delete('/:id', async (req, res, next) => {
  try {
    const deleted = await authorsService.deleteAuthor(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Author no encontrado' });
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
