// Script to insert initial items into the NeDB database for the inventory app
const path = require('path');
const Datastore = require('nedb-promises');

async function seed() {
  const db = Datastore.create({
    filename: path.join(__dirname, 'data/items.db'),
    autoload: true
  });

  const items = [
    { name: 'Laptop', description: 'Dell XPS 13, 16GB RAM, 512GB SSD', quantity: 10 },
    { name: 'Monitor', description: '24-inch Full HD Monitor', quantity: 15 },
    { name: 'Keyboard', description: 'Mechanical Keyboard, RGB', quantity: 25 },
    { name: 'Mouse', description: 'Wireless Mouse', quantity: 30 },
    { name: 'Webcam', description: 'HD USB Webcam', quantity: 12 }
  ];

  for (const item of items) {
    try {
      await db.insert(item);
      console.log(`Inserted: ${item.name}`);
    } catch (err) {
      if (err.errorType === 'uniqueViolated') {
        console.log(`Skipped (already exists): ${item.name}`);
      } else {
        console.error(`Error inserting ${item.name}:`, err.message);
      }
    }
  }
  console.log('Seeding complete.');
  process.exit(0);
}

seed();
