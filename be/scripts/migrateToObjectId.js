const mongoose = require('mongoose');
const Item = require('../src/models/itemModel');
require('dotenv').config();

async function migrate() {
    console.log('Starting migration to ObjectId references...');
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoUri) {
        console.error('Error: MONGO_URI or MONGODB_URI not found in environment');
        process.exit(1);
    }
    await mongoose.connect(mongoUri);

    // 1. Create a mapping of id (Number) -> _id (ObjectId)
    // Use raw collection to avoid Mongoose casting legacy Numbers to null/undefined
    const rawItems = await Item.collection.find({}).project({ id: 1, _id: 1 }).toArray();
    const idMap = new Map();
    for (const item of rawItems) {
        idMap.set(item.id, item._id);
    }
    console.log(`Mapped ${idMap.size} items.`);

    // 2. Update relationships
    const cursor = Item.collection.find({});
    let count = 0;
    while (await cursor.hasNext()) {
        const doc = await cursor.next();
        let update = {};
        let modified = false;

        // Convert parent
        if (doc.parent && typeof doc.parent === 'number') {
            const newParentId = idMap.get(doc.parent);
            if (newParentId) {
                update.parent = newParentId;
                modified = true;
            } else {
                console.warn(`Warning: parent ${doc.parent} not found for item ${doc.id}`);
            }
        }

        // Convert kids
        if (doc.kids && doc.kids.length > 0 && typeof doc.kids[0] === 'number') {
            const newKids = [];
            for (const kidId of doc.kids) {
                const newKidId = idMap.get(kidId);
                if (newKidId) {
                    newKids.push(newKidId);
                } else {
                    console.warn(`Warning: kid ${kidId} not found for item ${doc.id}`);
                }
            }
            if (newKids.length > 0) {
                update.kids = newKids;
                modified = true;
            }
        }

        if (modified) {
            await Item.collection.updateOne({ _id: doc._id }, { $set: update });
            count++;
        }
    }

    console.log(`Migration complete. Updated ${count} documents.`);
    process.exit(0);
}

migrate().catch(console.error);
