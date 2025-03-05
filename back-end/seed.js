const db = require('./config/db');
const bcrypt = require('bcryptjs');

const createTables = async () => {
  try {
    console.log('Creating tables if not exist...');

    // Create Users Table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        user_type ENUM('admin', 'user') NOT NULL,
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    // Create Customer Calculations Table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS customer_calculations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        customer_id VARCHAR(255) NOT NULL,
        customer_name VARCHAR(255) NOT NULL,
        meter_count INT NOT NULL,
        devices JSON NOT NULL,
        compensation_data JSON NOT NULL,
        monthly_devices JSON NOT NULL,
        paid_electricity JSON NOT NULL,
        created_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    console.log('Tables created successfully.');
  } catch (error) {
    console.error('Error creating tables:', error);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    console.log('Seeding database...');

    const hashedPassword = await bcrypt.hash('password123', 10);

    // Insert Admin User
    await db.execute(
      `INSERT INTO users (email, password, full_name, user_type, is_active) 
       VALUES (?, ?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), user_type = VALUES(user_type), is_active = VALUES(is_active);`,
      ['admin', hashedPassword, 'Admin User', 'admin', 1]
    );

    // Insert Regular User
    await db.execute(
      `INSERT INTO users (email, password, full_name, user_type, is_active) 
       VALUES (?, ?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), user_type = VALUES(user_type), is_active = VALUES(is_active);`,
      ['user', hashedPassword, 'Regular User', 'user', 1]
    );

    console.log('Seeding completed successfully!');
    process.exit();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

const runSeeder = async () => {
  await createTables();
  await seedData();
};

runSeeder();
