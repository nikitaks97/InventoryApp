// Script to insert initial items into the SQLite database for the inventory app
const { database } = require('./db');

async function seed() {
  try {
    await database.connect();
    
    // Check if database already has data
    const existingItems = await database.findAll();
    if (existingItems.length > 0) {
      console.log(`Database already contains ${existingItems.length} items. Skipping seed.`);
      await database.close();
      process.exit(0);
    }
    
    console.log('Database is empty. Starting seed process...');
    
    const items = [
      { name: 'Laptop', description: 'Dell XPS 13, 16GB RAM, 512GB SSD', quantity: 10 },
      { name: 'Monitor', description: '24-inch Full HD Monitor', quantity: 15 },
      { name: 'Keyboard', description: 'Mechanical Keyboard, RGB', quantity: 25 },
      { name: 'Mouse', description: 'Wireless Mouse', quantity: 30 },
      { name: 'Webcam', description: 'HD USB Webcam', quantity: 12 }
    ];

    let insertedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const item of items) {
      try {
        await database.create(item);
        console.log(`✅ Inserted: ${item.name}`);
        insertedCount++;
      } catch (err) {
        if (err.message.includes('already exists') || err.message.includes('UNIQUE constraint')) {
          console.log(`⏭️  Skipped (already exists): ${item.name}`);
          skippedCount++;
        } else {
          console.error(`❌ Error inserting ${item.name}:`, err.message);
          errorCount++;
        }
      }
    }
    
    console.log(`\n📊 Seeding Summary:`);
    console.log(`   - Inserted: ${insertedCount} items`);
    console.log(`   - Skipped: ${skippedCount} items`);
    console.log(`   - Errors: ${errorCount} items`);
    console.log('✅ Seeding complete.');
    
    await database.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    try {
      await database.close();
    } catch (closeError) {
      console.error('❌ Error closing database:', closeError.message);
    }
    process.exit(1);
  }
}

seed();
