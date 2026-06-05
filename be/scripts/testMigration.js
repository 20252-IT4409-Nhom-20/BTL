const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Item = require('../src/models/itemModel');

async function testMigration() {
    console.log('Starting migration test...');
    const mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);

    // 1. Setup Sample Data (Pre-migration state)
    // We manually construct items with legacy numeric ID references
    const storyId = 48282180;
    const commentId = 48310142;
    
    // Create documents with Number-based relationships
    // Bypass Mongoose validation to insert "legacy" data
    await Item.collection.insertOne({
        _id: new mongoose.Types.ObjectId(),
        id: storyId,
        type: 'story',
        title: 'Indoor Wi-Fi Roaming with OpenWRT',
        kids: [commentId], // Number reference
        parent: null
    });
    
    await Item.collection.insertOne({
        _id: new mongoose.Types.ObjectId(),
        id: commentId,
        type: 'comment',
        text: 'You can stick to 802.11r only...',
        kids: [],
        parent: storyId // Number reference
    });

    console.log('Sample data seeded.');

    // 2. Run Migration Logic (using raw collection access to avoid Mongoose casting issues)
    const idMap = new Map();
    const rawItems = await Item.collection.find({}).toArray();
    for (const item of rawItems) {
        idMap.set(item.id, item._id);
    }

    for (const doc of rawItems) {
        let update = {};
        let modified = false;

        // Convert parent
        if (doc.parent && typeof doc.parent === 'number') {
            update.parent = idMap.get(doc.parent);
            modified = true;
        }

        // Convert kids
        if (doc.kids && doc.kids.length > 0 && typeof doc.kids[0] === 'number') {
            update.kids = doc.kids.map(kidId => idMap.get(kidId));
            modified = true;
        }

        if (modified) {
            await Item.collection.updateOne({ _id: doc._id }, { $set: update });
        }
    }

    // 3. Verification
    const updatedStory = await Item.findOne({ id: storyId });
    const updatedComment = await Item.findOne({ id: commentId });

    console.log('\n--- Verification ---');
    console.log('Updated Story kids (should be ObjectId):', updatedStory.kids);
    console.log('Updated Comment parent (should be ObjectId):', updatedComment.parent);

    const isKidsCorrect = mongoose.Types.ObjectId.isValid(updatedStory.kids[0]);
    const isParentCorrect = mongoose.Types.ObjectId.isValid(updatedComment.parent);

    if (isKidsCorrect && isParentCorrect) {
        console.log('SUCCESS: Migration verified.');
    } else {
        console.error('FAILURE: Migration did not convert fields correctly.');
        process.exit(1);
    }

    await mongoose.connection.close();
    await mongoServer.stop();
    process.exit(0);
}

testMigration().catch(err => {
    console.error(err);
    process.exit(1);
});
