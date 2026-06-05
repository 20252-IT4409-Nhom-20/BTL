const request = require('supertest');
const app = require('../src/app');
const dbHandler = require('./db-handler');
const User = require('../src/models/userModel');
const Item = require('../src/models/itemModel');

beforeAll(async () => await dbHandler.connect());
afterEach(async () => await dbHandler.clearDatabase());
afterAll(async () => await dbHandler.closeDatabase());

describe('User Profile API', () => {
    it('returns public profile with dynamic stats', async () => {
        await User.create({
            username: 'alice',
            email: 'alice@example.com',
            password: 'password123',
            role: 'user',
        });

        await Item.create([
            { type: 'story', by: 'alice', title: 'Story 1', score: 5 },
            { type: 'story', by: 'alice', title: 'Story 2', score: 3 },
            { type: 'comment', by: 'alice', text: 'Comment 1', score: 2 },
            { type: 'comment', by: 'bob', text: 'Other user comment', score: 100 },
        ]);

        const res = await request(app).get('/api/users/alice/profile');

        expect(res.statusCode).toBe(200);
        expect(res.body.profile.username).toBe('alice');
        expect(res.body.profile.stats).toEqual({
            submissions: 2,
            comments: 1,
            karma: 10,
        });
    });

    it('does not expose sensitive fields in public profile', async () => {
        await User.create({
            username: 'alice',
            email: 'alice@example.com',
            password: 'password123',
            role: 'user',
            isBanned: true,
            banReason: 'test reason',
        });

        const res = await request(app).get('/api/users/alice/profile');

        expect(res.statusCode).toBe(200);
        expect(res.body.profile).not.toHaveProperty('password');
        expect(res.body.profile).not.toHaveProperty('email');
        expect(res.body.profile).not.toHaveProperty('isBanned');
        expect(res.body.profile).not.toHaveProperty('banReason');
        expect(res.body.profile).not.toHaveProperty('bannedAt');
        expect(res.body.profile).not.toHaveProperty('bannedBy');
    });

    it('returns 404 when user does not exist', async () => {
        const res = await request(app).get('/api/users/missing/profile');

        expect(res.statusCode).toBe(404);
        expect(res.body.message).toBe('User not found');
    });
});
