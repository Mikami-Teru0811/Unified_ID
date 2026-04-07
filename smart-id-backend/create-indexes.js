import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/smartid';

async function createIndexes() {
    try {
        console.log('Connecting to MongoDB Atlas...');
        await mongoose.connect(MONGO_URI);
        console.log('Connected successfully!\n');

        const db = mongoose.connection.db;

        // Check for duplicate phone numbers
        console.log('=== Checking for duplicate phone numbers ===');
        const duplicatePhones = await db.collection('patients').aggregate([
            { $group: { _id: "$phone", count: { $sum: 1 } } },
            { $match: { count: { $gt: 1 } } }
        ]).toArray();

        if (duplicatePhones.length > 0) {
            console.log('⚠️  Found duplicate phone numbers:');
            duplicatePhones.forEach(d => {
                console.log(`   Phone: ${d._id}, Count: ${d.count}`);
            });
            console.log('\n⚠️  Please resolve duplicates before creating unique index.');
            console.log('   Option 1: Update duplicates with unique phone numbers');
            console.log('   Option 2: Delete duplicate records');
            console.log('   Option 3: Set phone to null for patients you want to keep one of\n');
        } else {
            console.log('✅ No duplicate phone numbers found.\n');
        }

        // Create indexes on patients collection
        console.log('=== Creating indexes on patients collection ===');
        
        const patientIndexes = [
            { key: { phone: 1 }, unique: true, name: 'phone_1' },
            { key: { nfcUuid: 1 }, unique: true, sparse: true, name: 'nfcUuid_1' },
            { key: { fingerprintId: 1 }, unique: true, sparse: true, name: 'fingerprintId_1' },
            { key: { fullName: 1 }, name: 'fullName_1' },
            { key: { fullName: 1, phone: 1 }, name: 'fullName_1_phone_1' },
            { key: { govtId: 1 }, name: 'govtId_1' },
            { key: { dob: 1 }, name: 'dob_1' },
            { key: { age: 1 }, name: 'age_1' },
            { key: { gender: 1 }, name: 'gender_1' },
            { key: { bloodGroup: 1 }, name: 'bloodGroup_1' },
            { key: { heightCm: 1 }, name: 'heightCm_1' },
            { key: { weightKg: 1 }, name: 'weightKg_1' },
            { key: { 'emergencyContact.name': 1 }, name: 'emergencyContact.name_1' },
            { key: { 'emergencyContact.phone': 1 }, name: 'emergencyContact.phone_1' },
            { key: { allergies: 1 }, name: 'allergies_1' }
        ];

        for (const index of patientIndexes) {
            try {
                await db.collection('patients').createIndex(index.key, {
                    unique: index.unique || false,
                    sparse: index.sparse || false,
                    name: index.name
                });
                console.log(`✅ Created index: ${index.name}`);
            } catch (err) {
                if (err.code === 85 || err.code === 86) {
                    console.log(`⚠️  Index ${index.name} exists with different options: ${err.errmsg}`);
                } else {
                    console.log(`❌ Error creating ${index.name}: ${err.message}`);
                }
            }
        }

        // Create indexes on users collection
        console.log('\n=== Creating indexes on users collection ===');
        
        const userIndexes = [
            { key: { username: 1 }, unique: true, name: 'username_1' },
            { key: { email: 1 }, unique: true, sparse: true, name: 'email_1' },
            { key: { role: 1, createdAt: -1 }, name: 'role_1_createdAt_-1' }
        ];

        for (const index of userIndexes) {
            try {
                await db.collection('users').createIndex(index.key, {
                    unique: index.unique || false,
                    sparse: index.sparse || false,
                    name: index.name
                });
                console.log(`✅ Created index: ${index.name}`);
            } catch (err) {
                if (err.code === 85 || err.code === 86) {
                    console.log(`⚠️  Index ${index.name} exists with different options: ${err.errmsg}`);
                } else {
                    console.log(`❌ Error creating ${index.name}: ${err.message}`);
                }
            }
        }

        // List all indexes
        console.log('\n=== Current indexes on patients collection ===');
        const patientIndexList = await db.collection('patients').indexes();
        patientIndexList.forEach(idx => {
            console.log(`   ${idx.name}: ${JSON.stringify(idx.key)}`);
        });

        console.log('\n=== Current indexes on users collection ===');
        const userIndexList = await db.collection('users').indexes();
        userIndexList.forEach(idx => {
            console.log(`   ${idx.name}: ${JSON.stringify(idx.key)}`);
        });

        console.log('\n✅ Index creation complete!');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('\nDisconnected from MongoDB Atlas.');
    }
}

createIndexes();
