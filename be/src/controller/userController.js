const express = require('express');
const {
    getPublicProfileByUsername,
} = require('../services/userProfileService');

const router = express.Router();

router.get('/:username/profile', async (req, res) => {
    try {
        const username = String(req.params.username || '').trim();

        if (!username) {
            return res.status(400).json({ message: 'Username is required' });
        }

        const profile = await getPublicProfileByUsername(username);

        if (!profile) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.json({ profile });
    } catch (err) {
        return res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
