function serializePublicUser(user, stats) {
    return {
        id: user._id.toString(),
        username: user.username,
        role: user.role,
        createdAt: user.createdAt,
        stats,
    };
}

function serializePrivateUser(user) {
    return {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
    };
}

module.exports = {
    serializePublicUser,
    serializePrivateUser,
};
