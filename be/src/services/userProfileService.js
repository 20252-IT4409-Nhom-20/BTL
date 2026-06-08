const User = require('../models/userModel');
const Item = require('../models/itemModel');
const { serializePublicUser } = require('./userSerializer');

async function getUserStats(username) {
    const [submissions, comments] = await Promise.all([
        Item.countDocuments({
            by: username,
            type: 'story',
            deleted: { $ne: true },
            dead: { $ne: true },
        }),
        Item.countDocuments({
            by: username,
            type: 'comment',
            deleted: { $ne: true },
            dead: { $ne: true },
        }),
    ]);

    return {
        submissions,
        comments,
    };
}

async function getPublicProfileByUsername(username) {
    const user = await User.findOne({ username }).select(
        'username role createdAt'
    );

    if (!user) return null;

    const stats = await getUserStats(user.username);
    return serializePublicUser(user, stats);
}

module.exports = {
    getUserStats,
    getPublicProfileByUsername,
};
