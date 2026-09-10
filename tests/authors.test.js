const request = require('supertest');
const app = require('../src/app');

describe('Authors API', () => {
  it('GET /authors devuelve un array con status 200', async () => {
    const res = await request(app).get('/authors');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /authors/:id devuelve 404 si no existe', async () => {
    const res = await request(app).get('/authors/999999');
    expect(res.status).toBe(404);
  });

  it('POST /authors crea un nuevo author', async () => {
    const res = await request(app)
      .post('/authors')
      .send({ name: 'Test Author', email: `test${Date.now()}@example.com`, bio: 'bio de prueba' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
  });

  it('DELETE /authors/:id devuelve 404 si el recurso no existe', async () => {
    const res = await request(app).delete('/authors/999999');
    expect(res.status).toBe(404);
  });
});
