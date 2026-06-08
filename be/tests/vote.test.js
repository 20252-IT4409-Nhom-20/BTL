const mongoose = require('mongoose');
const dbHandler = require('./db-handler');
const voteService = require('../src/services/voteService');
const Item = require('../src/models/itemModel');
const Vote = require('../src/models/voteModel');

beforeAll(async () => await dbHandler.connect());
afterEach(async () => await dbHandler.clearDatabase());
afterAll(async () => await dbHandler.closeDatabase());

async function makeItem(overrides = {}) {
    const item = new Item({
        title: 'Vote test item',
        type: 'story',
        by: 'author',
        score: 0,
        ...overrides,
    });
    return await item.save();
}

function makeUserId() {
    return new mongoose.Types.ObjectId();
}

describe('voteService.castVote', () => {
    it('records a first-time upvote and increments score by +1', async () => {
        const item = await makeItem({ score: 10 });
        const userId = makeUserId();

        const result = await voteService.castVote({
            userId,
            itemId: item._id,
            direction: 1,
        });

        expect(result).toMatchObject({ score: 11, userVote: 1, scoreDelta: 1 });

        const vote = await Vote.findOne({ user: userId, item: item._id });
        expect(vote.direction).toBe(1);
    });

    it('records a first-time downvote and decrements score by 1', async () => {
        const item = await makeItem({ score: 5 });
        const userId = makeUserId();

        const result = await voteService.castVote({
            userId,
            itemId: item._id,
            direction: -1,
        });

        expect(result).toMatchObject({ score: 4, userVote: -1, scoreDelta: -1 });

        const vote = await Vote.findOne({ user: userId, item: item._id });
        expect(vote.direction).toBe(-1);
    });

    it('toggles off a same-direction repeat vote and reverts score', async () => {
        const item = await makeItem({ score: 0 });
        const userId = makeUserId();

        await voteService.castVote({ userId, itemId: item._id, direction: 1 });
        const result = await voteService.castVote({
            userId,
            itemId: item._id,
            direction: 1,
        });

        expect(result).toMatchObject({ score: 0, userVote: 0, scoreDelta: -1 });

        const vote = await Vote.findOne({ user: userId, item: item._id });
        expect(vote).toBeNull();
    });

    it('switches direction (+1 -> -1) and applies score delta of -2', async () => {
        const item = await makeItem({ score: 0 });
        const userId = makeUserId();

        await voteService.castVote({ userId, itemId: item._id, direction: 1 });
        const result = await voteService.castVote({
            userId,
            itemId: item._id,
            direction: -1,
        });

        expect(result).toMatchObject({ score: -1, userVote: -1, scoreDelta: -2 });

        const vote = await Vote.findOne({ user: userId, item: item._id });
        expect(vote.direction).toBe(-1);
    });

    it('switches direction (-1 -> +1) and applies score delta of +2', async () => {
        const item = await makeItem({ score: 10 });
        const userId = makeUserId();

        await voteService.castVote({ userId, itemId: item._id, direction: -1 });
        const result = await voteService.castVote({
            userId,
            itemId: item._id,
            direction: 1,
        });

        expect(result).toMatchObject({ score: 11, userVote: 1, scoreDelta: 2 });

        const vote = await Vote.findOne({ user: userId, item: item._id });
        expect(vote.direction).toBe(1);
    });

    it('keeps separate vote rows per user on the same item', async () => {
        const item = await makeItem({ score: 0 });
        const userA = makeUserId();
        const userB = makeUserId();

        const a = await voteService.castVote({ userId: userA, itemId: item._id, direction: 1 });
        const b = await voteService.castVote({ userId: userB, itemId: item._id, direction: 1 });

        expect(a.score).toBe(1);
        expect(b.score).toBe(2);

        const votes = await Vote.find({ item: item._id });
        expect(votes).toHaveLength(2);
    });

    it('rejects an invalid direction with INVALID_DIRECTION', async () => {
        const item = await makeItem();
        const userId = makeUserId();

        await expect(
            voteService.castVote({ userId, itemId: item._id, direction: 5 })
        ).rejects.toMatchObject({ code: 'INVALID_DIRECTION', status: 400 });
    });

    it('rejects a non-ObjectId itemId with INVALID_ITEM_ID', async () => {
        await expect(
            voteService.castVote({
                userId: makeUserId(),
                itemId: 'not-an-id',
                direction: 1,
            })
        ).rejects.toMatchObject({ code: 'INVALID_ITEM_ID', status: 400 });
    });

    it('returns ITEM_NOT_FOUND when item does not exist', async () => {
        await expect(
            voteService.castVote({
                userId: makeUserId(),
                itemId: new mongoose.Types.ObjectId(),
                direction: 1,
            })
        ).rejects.toMatchObject({ code: 'ITEM_NOT_FOUND', status: 404 });
    });

    it('coerces a string direction to a number', async () => {
        const item = await makeItem({ score: 0 });
        const userId = makeUserId();

        const result = await voteService.castVote({
            userId,
            itemId: item._id,
            direction: '1',
        });

        expect(result.userVote).toBe(1);
    });

    it('enforces the unique (user, item) index at the DB level', async () => {
        const item = await makeItem();
        const userId = makeUserId();

        await Vote.create({ user: userId, item: item._id, direction: 1 });
        await expect(
            Vote.create({ user: userId, item: item._id, direction: -1 })
        ).rejects.toThrow();
    });
});

describe('voteService.getVoteState', () => {
    it('returns userVote 0 when the caller has no vote on the item', async () => {
        const item = await makeItem({ score: 42 });
        const userId = makeUserId();

        const state = await voteService.getVoteState({ userId, itemId: item._id });

        expect(state).toEqual({ score: 42, userVote: 0 });
    });

    it('returns the caller current vote direction', async () => {
        const item = await makeItem({ score: 7 });
        const userId = makeUserId();
        await voteService.castVote({ userId, itemId: item._id, direction: -1 });

        const state = await voteService.getVoteState({ userId, itemId: item._id });

        expect(state).toEqual({ score: 6, userVote: -1 });
    });

    it('returns userVote 0 for anonymous (no userId) callers', async () => {
        const item = await makeItem({ score: 3 });

        const state = await voteService.getVoteState({ userId: null, itemId: item._id });

        expect(state).toEqual({ score: 3, userVote: 0 });
    });

    it('throws INVALID_ITEM_ID on a non-ObjectId id', async () => {
        await expect(
            voteService.getVoteState({ userId: makeUserId(), itemId: 'not-an-id' })
        ).rejects.toMatchObject({ code: 'INVALID_ITEM_ID', status: 400 });
    });

    it('throws ITEM_NOT_FOUND when the item is missing', async () => {
        await expect(
            voteService.getVoteState({
                userId: makeUserId(),
                itemId: new mongoose.Types.ObjectId(),
            })
        ).rejects.toMatchObject({ code: 'ITEM_NOT_FOUND', status: 404 });
    });
});
