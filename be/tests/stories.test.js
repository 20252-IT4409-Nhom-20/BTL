const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const dbHandler = require('./db-handler');
const storiesController = require('../src/controller/storiesController');
const Item = require('../src/models/itemModel');

const app = express();
app.use(bodyParser.json());
app.post('/stories', storiesController.createStory);
app.post('/comments', storiesController.createComment);
app.get('/stories/item/:id', storiesController.getItem);

beforeAll(async () => await dbHandler.connect());
afterEach(async () => await dbHandler.clearDatabase());
afterAll(async () => await dbHandler.closeDatabase());

describe('Stories API', () => {
    it('should create a story', async () => {
        const response = await request(app)
            .post('/stories')
            .send({
                title: 'Test Story',
                url: 'http://example.com',
                type: 'story'
            });

        expect(response.statusCode).toBe(201);
        expect(response.body.title).toBe('Test Story');
        expect(response.body).toHaveProperty('_id');
    });

    it('should create a comment and link to parent', async () => {
        // Create parent story first
        const story = new Item({
            title: 'Parent Story',
            type: 'story',
            by: 'user1'
        });
        await story.save();

        const response = await request(app)
            .post('/comments')
            .send({
                text: 'Test comment',
                parent_id: story._id,
                root_id: story._id
            });

        expect(response.statusCode).toBe(201);
        expect(response.body.text).toBe('Test comment');
        expect(response.body.parent.toString()).toBe(story._id.toString());

        // Verify parent has updated kids array
        const updatedStory = await Item.findById(story._id);
        expect(updatedStory.kids.map(id => id.toString())).toContain(response.body._id);
        expect(updatedStory.descendants).toBe(1);
    });

    it('should create a nested comment (reply to a comment)', async () => {
        // 1. Create root story
        const story = new Item({
            title: 'Root Story',
            type: 'story',
            by: 'user1'
        });
        await story.save();

        // 2. Create first-level comment
        const comment1Response = await request(app)
            .post('/comments')
            .send({
                text: 'First level comment',
                parent_id: story._id,
                root_id: story._id
            });
        const comment1Id = comment1Response.body._id;

        // 3. Create second-level comment (reply to comment1)
        const comment2Response = await request(app)
            .post('/comments')
            .send({
                text: 'Second level comment',
                parent_id: comment1Id,
                root_id: story._id
            });

        expect(comment2Response.statusCode).toBe(201);
        expect(comment2Response.body.parent.toString()).toBe(comment1Id.toString());

        // 4. Verify level 1 comment has updated kids
        const updatedComment1 = await Item.findById(comment1Id);
        expect(updatedComment1.kids.map(id => id.toString())).toContain(comment2Response.body._id);

        // 5. Verify root story has correct total descendants
        const updatedStory = await Item.findById(story._id);
        expect(updatedStory.descendants).toBe(2);
    });

    it('should fetch item with comments', async () => {
        const story = new Item({ title: 'Root Story', type: 'story', by: 'user1' });
        await story.save();

        const comment = new Item({
            text: 'Child comment',
            type: 'comment',
            parent: story._id,
            by: 'user2'
        });
        await comment.save();
        
        story.kids.push(comment._id);
        await story.save();

        const response = await request(app)
            .get(`/stories/item/${story._id}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.item[0]._id).toBe(story._id.toString());
        expect(response.body.item.length).toBe(2);
    });
});
