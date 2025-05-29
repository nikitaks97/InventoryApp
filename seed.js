// Script to insert initial items into the SQLite database for the inventory app
const { database } = require('./db');

async function seed() {
  try {
    await database.connect();
    
    const items = [
      { name: 'Laptop', description: 'Dell XPS 13, 16GB RAM, 512GB SSD', quantity: 10 },
      { name: 'Monitor', description: '24-inch Full HD Monitor', quantity: 15 },
      { name: 'Keyboard', description: 'Mechanical Keyboard, RGB', quantity: 25 },
      { name: 'Mouse', description: 'Wireless Mouse', quantity: 30 },
      { name: 'Webcam', description: 'HD USB Webcam', quantity: 12 }
    ];

    for (const item of items) {
      try {
        await database.create(item);
        console.log(`Inserted: ${item.name}`);
      } catch (err) {
        if (err.message.includes('already exists')) {
          console.log(`Skipped (already exists): ${item.name}`);
        } else {
          console.error(`Error inserting ${item.name}:`, err.message);
        }
      }
    }
    
    console.log('Seeding complete.');
    await database.close();
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
