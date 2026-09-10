require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db/pool');
const authorsRouter = require('./routes/authors.routes');
const postsRouter = require('./routes/posts.routes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

// Endpoint de prueba: confirma que Express está corriendo
// y que la conexión a PostgreSQL funciona.
app.get('/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ status: 'ok', db_time: result.rows[0].now });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: 'No se pudo conectar a la base de datos' });
  }
});

app.use('/authors', authorsRouter);
app.use('/posts', postsRouter);

// Middleware de manejo de errores: siempre al final, después de las rutas
app.use(errorHandler);

module.exports = app;
