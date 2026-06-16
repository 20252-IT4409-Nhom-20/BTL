const express = require('express');
const request = require('supertest');
const APIError = require('../src/utils/APIError');
const errorHandler = require('../src/middleware/errorHandler');

function buildApp(routeHandler) {
  const app = express();
  app.get('/test', routeHandler);
  app.use(errorHandler);
  return app;
}

describe('errorHandler', () => {
  const originalNodeEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  it('formats APIError responses with status, code, and message', async () => {
    const app = buildApp((req, res, next) => {
      next(new APIError(404, 'NOT_FOUND', 'Resource not found'));
    });

    const res = await request(app).get('/test');

    expect(res.statusCode).toBe(404);
    expect(res.body).toMatchObject({
      status: 'error',
      code: 'NOT_FOUND',
      message: 'Resource not found',
    });
  });

  it('hides raw stack traces from production error responses', async () => {
    process.env.NODE_ENV = 'production';

    const app = buildApp((req, res, next) => {
      next(new Error('Database exploded'));
    });

    const res = await request(app).get('/test');

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({
      status: 'error',
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Internal server error',
    });
  });
});
