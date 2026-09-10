const request = require('supertest');
const app = require('../src/app');

describe('Posts API', () => {
  it('GET /posts devuelve un array con status 200', async () => {
    const res = await request(app).get('/posts');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /posts crea un nuevo post', async () => {
    const res = await request(app)
      .post('/posts')
      .send({ title: 'Post de prueba', content: 'Contenido de prueba', author_id: 1 });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
  });

  it('GET /posts/author/:authorId devuelve un array con status 200', async () => {
    const res = await request(app).get('/posts/author/1');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
