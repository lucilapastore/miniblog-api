require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db/pool');

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
