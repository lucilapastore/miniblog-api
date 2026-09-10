// Middleware global de manejo de errores.
// Cualquier error pasado con next(err) desde las rutas termina acá.
function errorHandler(err, req, res, next) {
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
}

module.exports = errorHandler;
