const dbHandler = require('./db-handler');
const Item = require('../src/models/itemModel');
const {
  canModifyItem,
  assertCanModifyItem,
} = require('../src/services/authorizationService');

beforeAll(async () => await dbHandler.connect());
afterEach(async () => await dbHandler.clearDatabase());
afterAll(async () => await dbHandler.closeDatabase());

describe('item permission helpers', () => {
  it('allows the item owner to modify an item', () => {
    const user = { username: 'alice', role: 'user' };
    const item = { by: 'alice' };

    expect(canModifyItem(user, item)).toBe(true);
  });

  it('rejects a non-owner user', () => {
    const user = { username: 'bob', role: 'user' };
    const item = { by: 'alice' };

    expect(canModifyItem(user, item)).toBe(false);
  });

  it('allows moderators and admins to modify any item', () => {
    const item = { by: 'alice' };

    expect(canModifyItem({ username: 'mod', role: 'moderator' }, item)).toBe(true);
    expect(canModifyItem({ username: 'admin', role: 'admin' }, item)).toBe(true);
  });

  it('returns the item when the user is authorized', async () => {
    const item = await Item.create({
      type: 'story',
      by: 'alice',
      title: 'Story',
    });

    const result = await assertCanModifyItem(
      { username: 'alice', role: 'user' },
      item._id
    );

    expect(result._id.toString()).toBe(item._id.toString());
  });

  it('throws 403 when the user cannot modify the item', async () => {
    const item = await Item.create({
      type: 'story',
      by: 'alice',
      title: 'Story',
    });

    await expect(
      assertCanModifyItem({ username: 'bob', role: 'user' }, item._id)
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  it('throws 404 when the item does not exist', async () => {
    const missingItemId = '507f1f77bcf86cd799439011';

    await expect(
      assertCanModifyItem({ username: 'alice', role: 'user' }, missingItemId)
    ).rejects.toMatchObject({ statusCode: 404 });
  });
});
