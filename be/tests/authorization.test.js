const mongoose = require('mongoose');
const dbHandler = require('./db-handler');
const storiesService = require('../src/services/storiesService');
const Item = require('../src/models/itemModel');

beforeAll(async () => await dbHandler.connect());
afterEach(async () => await dbHandler.clearDatabase());
afterAll(async () => await dbHandler.closeDatabase());

// time is seconds-since-epoch in the HN model. Helpers below build items
// that look "fresh" (within the 2h edit window) or "stale" (older).
function nowSec() {
    return Math.floor(Date.now() / 1000);
}
function staleSec() {
    return nowSec() - 60 * 60 * 3; // 3 hours ago
}

async function makeStory(overrides = {}) {
    const story = new Item({
        title: 'Auth test story',
        type: 'story',
        by: 'alice',
        time: nowSec(),
        ...overrides,
    });
    return await story.save();
}

const aliceActor = { id: new mongoose.Types.ObjectId(), username: 'alice', role: 'user' };
const bobActor = { id: new mongoose.Types.ObjectId(), username: 'bob', role: 'user' };
const adminActor = { id: new mongoose.Types.ObjectId(), username: 'mallory', role: 'admin' };

describe('storiesService.deleteItem', () => {
    it('soft-deletes when called by the owner within the edit window', async () => {
        const story = await makeStory();

        const result = await storiesService.deleteItem({
            itemId: story._id,
            actor: aliceActor,
        });

        expect(result).toMatchObject({ ok: true, deleted: true });

        const reloaded = await Item.findById(story._id);
        expect(reloaded.deleted).toBe(true);
        // Soft delete: the document is preserved.
        expect(reloaded.title).toBe('Auth test story');
    });

    it('refuses with FORBIDDEN when actor is not the owner and not admin', async () => {
        const story = await makeStory();

        await expect(
            storiesService.deleteItem({ itemId: story._id, actor: bobActor })
        ).rejects.toMatchObject({ code: 'FORBIDDEN', status: 403 });

        const reloaded = await Item.findById(story._id);
        expect(reloaded.deleted).toBe(false);
    });

    it('allows admin to delete any item regardless of owner', async () => {
        const story = await makeStory({ by: 'someone-else' });

        const result = await storiesService.deleteItem({
            itemId: story._id,
            actor: adminActor,
        });

        expect(result.deleted).toBe(true);
    });

    it('returns EDIT_WINDOW_EXPIRED for items older than 2 hours', async () => {
        const story = await makeStory({ time: staleSec() });

        await expect(
            storiesService.deleteItem({ itemId: story._id, actor: aliceActor })
        ).rejects.toMatchObject({ code: 'EDIT_WINDOW_EXPIRED', status: 400 });
    });

    it('is idempotent: second delete on already-deleted item returns alreadyDeleted', async () => {
        const story = await makeStory({ deleted: true });

        const result = await storiesService.deleteItem({
            itemId: story._id,
            actor: aliceActor,
        });

        expect(result).toMatchObject({ ok: true, alreadyDeleted: true });
    });

    it('throws INVALID_ITEM_ID on a non-ObjectId id', async () => {
        await expect(
            storiesService.deleteItem({ itemId: 'not-an-id', actor: aliceActor })
        ).rejects.toMatchObject({ code: 'INVALID_ITEM_ID', status: 400 });
    });

    it('throws ITEM_NOT_FOUND when the item does not exist', async () => {
        await expect(
            storiesService.deleteItem({
                itemId: new mongoose.Types.ObjectId(),
                actor: aliceActor,
            })
        ).rejects.toMatchObject({ code: 'ITEM_NOT_FOUND', status: 404 });
    });
});

describe('storiesService.editItem', () => {
    it('edits whitelisted fields and stamps editedBy/editedAt', async () => {
        const story = await makeStory({ title: 'Old', text: '' });
        const before = Date.now();

        const result = await storiesService.editItem({
            itemId: story._id,
            updates: { title: 'New title', text: 'New body' },
            actor: aliceActor,
        });

        expect(result.title).toBe('New title');
        expect(result.text).toBe('New body');
        expect(String(result.editedBy)).toBe(String(aliceActor.id));
        expect(new Date(result.editedAt).getTime()).toBeGreaterThanOrEqual(before);
    });

    it('ignores non-whitelisted fields (score, by, parent) silently', async () => {
        const story = await makeStory({ score: 5, by: 'alice' });

        const result = await storiesService.editItem({
            itemId: story._id,
            updates: { title: 'Renamed', score: 9999, by: 'attacker' },
            actor: aliceActor,
        });

        expect(result.title).toBe('Renamed');
        expect(result.score).toBe(5);
        expect(result.by).toBe('alice');
    });

    it('rejects FORBIDDEN when actor is not owner', async () => {
        const story = await makeStory();

        await expect(
            storiesService.editItem({
                itemId: story._id,
                updates: { title: 'Hijacked' },
                actor: bobActor,
            })
        ).rejects.toMatchObject({ code: 'FORBIDDEN', status: 403 });
    });

    it('allows admin to edit anyone item', async () => {
        const story = await makeStory({ by: 'someone-else' });

        const result = await storiesService.editItem({
            itemId: story._id,
            updates: { title: 'Mod edit' },
            actor: adminActor,
        });

        expect(result.title).toBe('Mod edit');
        expect(String(result.editedBy)).toBe(String(adminActor.id));
    });

    it('rejects EDIT_WINDOW_EXPIRED for items older than 2 hours', async () => {
        const story = await makeStory({ time: staleSec() });

        await expect(
            storiesService.editItem({
                itemId: story._id,
                updates: { title: 'Late edit' },
                actor: aliceActor,
            })
        ).rejects.toMatchObject({ code: 'EDIT_WINDOW_EXPIRED', status: 400 });
    });

    it('rejects ITEM_DELETED when item is already soft-deleted', async () => {
        const story = await makeStory({ deleted: true });

        await expect(
            storiesService.editItem({
                itemId: story._id,
                updates: { title: 'Resurrect' },
                actor: aliceActor,
            })
        ).rejects.toMatchObject({ code: 'ITEM_DELETED', status: 400 });
    });

    it('rejects NO_EDITABLE_FIELDS when only non-whitelisted fields supplied', async () => {
        const story = await makeStory();

        await expect(
            storiesService.editItem({
                itemId: story._id,
                updates: { score: 100 },
                actor: aliceActor,
            })
        ).rejects.toMatchObject({ code: 'NO_EDITABLE_FIELDS', status: 400 });
    });

    it('rejects non-string values for editable fields', async () => {
        const story = await makeStory();

        await expect(
            storiesService.editItem({
                itemId: story._id,
                updates: { title: 12345, text: { hack: true } },
                actor: aliceActor,
            })
        ).rejects.toMatchObject({ code: 'NO_EDITABLE_FIELDS' });
    });

    it('throws INVALID_ITEM_ID on a non-ObjectId id', async () => {
        await expect(
            storiesService.editItem({
                itemId: 'not-an-id',
                updates: { title: 'x' },
                actor: aliceActor,
            })
        ).rejects.toMatchObject({ code: 'INVALID_ITEM_ID', status: 400 });
    });

    it('throws ITEM_NOT_FOUND when the item is missing', async () => {
        await expect(
            storiesService.editItem({
                itemId: new mongoose.Types.ObjectId(),
                updates: { title: 'x' },
                actor: aliceActor,
            })
        ).rejects.toMatchObject({ code: 'ITEM_NOT_FOUND', status: 404 });
    });
});

describe('soft-delete masking in read paths', () => {
    it('omits deleted stories from getStories feed', async () => {
        await makeStory({ title: 'Alive story', score: 10 });
        await makeStory({ title: 'Dead story', score: 5, deleted: true, by: 'ghost' });

        const feed = await storiesService.getStories('top', 1, 50);
        const titles = feed.items.map((i) => i.title);

        expect(titles).toContain('Alive story');
        expect(titles).not.toContain('Dead story');
    });

    it('keeps deleted comments in the tree under getItemWithComments and masks them', async () => {
        const story = await makeStory();
        const deletedComment = await new Item({
            type: 'comment',
            parent: story._id,
            by: 'ghost',
            text: 'will be removed',
            time: nowSec(),
            deleted: true,
        }).save();
        // Reply under a deleted comment must still be reachable.
        await new Item({
            type: 'comment',
            parent: deletedComment._id,
            by: 'survivor',
            text: 'I am still here',
            time: nowSec(),
        }).save();

        const result = await storiesService.getItemWithComments(story._id);
        const dead = result.item.find((n) => String(n._id) === String(deletedComment._id));

        expect(dead).toBeDefined();
        expect(dead.by).toBe('[deleted]');
        expect(dead.text).toBe('[deleted]');
        // Child preserved on the masked parent.
        expect(dead.kids).toHaveLength(1);
        expect(dead.kids[0].text).toBe('I am still here');
        expect(dead.kids[0].by).toBe('survivor');
    });

    it('does not mask non-deleted items', async () => {
        await makeStory({ title: 'Untouched', by: 'alice' });

        const feed = await storiesService.getStories('top', 1, 50);
        const item = feed.items.find((i) => i.title === 'Untouched');

        expect(item.by).toBe('alice');
        expect(item.title).toBe('Untouched');
    });
});
