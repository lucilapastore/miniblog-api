# MiniBlog API

API REST en Node.js + Express, con persistencia en PostgreSQL, para gestionar `authors` y `posts`.
Proyecto Integrador - Módulo 2 (DevSpark / Henry).

## Requisitos
- Node.js 18+
- PostgreSQL 14+

## Setup local
1. Cloná el repo y entrá a la carpeta.
2. `npm install`
3. Copiá `.env.example` a `.env` y completá tus datos de conexión a PostgreSQL.
4. Creá la base: `createdb -U postgres miniblog_db`
5. Cargá el schema y el seed: `psql -U postgres -d miniblog_db -f sql/setup.sql`
6. Levantá el server: `node src/server.js`
7. Probá: `http://localhost:3000/health`

## Endpoints
- `GET /authors`, `GET /authors/:id`, `POST /authors`, `PUT /authors/:id`, `DELETE /authors/:id`
- `GET /posts`, `GET /posts/:id`, `GET /posts/author/:authorId`, `POST /posts`, `PUT /posts/:id`, `DELETE /posts/:id`

## Tests
```
npm test
```
Cubren: listado, detalle inexistente (404), creación (201) y validación de FK, para authors y posts.

## Documentación OpenAPI
Ver `openapi.yaml` en la raíz. Se puede visualizar pegando el contenido en https://editor.swagger.io

## Deployment (Railway)
- URL pública: [COMPLETAR CON LA URL DE RAILWAY]
- Variables de entorno configuradas en Railway: mismas claves que `.env.example`, con los valores que provee Railway para su base PostgreSQL.

## Uso de IA
Se utilizó Claude (Anthropic) como asistente durante el desarrollo: para planificar la estructura del backend, generar el script SQL de setup/seed, el código de conexión a PostgreSQL, los servicios y rutas CRUD de `authors` y `posts`, los tests con supertest, la especificación OpenAPI y este README. Las decisiones de arquitectura (separación routes/services, queries parametrizadas, middleware de errores) siguieron la guía del proyecto y fueron probadas manualmente (Postman) antes de integrarlas.
