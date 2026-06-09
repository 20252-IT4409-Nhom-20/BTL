const request = require('supertest');
const app = require('../src/app');
const dbHandler = require('./db-handler');
const User = require('../src/models/userModel');

beforeAll(async () => await dbHandler.connect());
afterEach(async () => await dbHandler.clearDatabase());
afterAll(async () => await dbHandler.closeDatabase());

describe('Auth Endpoints', () => {
  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });
    
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('user');
    expect(res.body.user.username).toEqual('testuser');
    expect(res.body.user).not.toHaveProperty('password');
  });

  it('should not register user with existing email', async () => {
    await User.create({
      username: 'existing',
      email: 'test@example.com',
      password: 'password123'
    });

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'newuser',
        email: 'test@example.com',
        password: 'password123'
    });
    
    expect(res.statusCode).toEqual(400);
    expect(res.body).toMatchObject({
      status: 'error',
      code: 'USER_EXISTS',
      message: 'User already exists',
    });
  });

  it('should return a structured error for missing credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({});

    expect(res.statusCode).toEqual(400);
    expect(res.body).toMatchObject({
      status: 'error',
      code: 'VALIDATION_ERROR',
      message: 'Credentials required',
    });
  });

  it('should login an existing user', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
  });

  it('should return a structured error for protected routes without auth', async () => {
    const res = await request(app).get('/api/auth/me');

    expect(res.statusCode).toEqual(401);
    expect(res.body).toMatchObject({
      status: 'error',
      code: 'UNAUTHORIZED',
      message: 'Missing or invalid Authorization header',
    });
  });
});
