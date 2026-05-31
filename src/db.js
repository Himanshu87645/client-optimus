const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.resolve(__dirname, 'gym.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to connect to the database:', err.message);
  } else {
    console.log('Connected to the SQLite database at:', dbPath);
  }
});

// Helper to run query as a promise
db.runAsync = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

db.getAsync = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

db.allAsync = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

// Initialize schema
async function initDatabase() {
  try {
    // Enable foreign keys
    await db.runAsync('PRAGMA foreign_keys = ON;');

    // Users table
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'member',
        membership_tier TEXT DEFAULT 'None',
        membership_status TEXT DEFAULT 'Inactive',
        joined_date TEXT DEFAULT CURRENT_TIMESTAMP,
        age INTEGER DEFAULT 25,
        height REAL DEFAULT 178,
        weight REAL DEFAULT 76,
        gender TEXT DEFAULT 'male',
        fitness_goal TEXT DEFAULT 'maintenance',
        body_shape TEXT DEFAULT 'mesomorph'
      )
    `);

    // Self-healing database migrations for existing user rows
    const colsToMigrate = [
      { name: "age", type: "INTEGER DEFAULT 25" },
      { name: "height", type: "REAL DEFAULT 178" },
      { name: "weight", type: "REAL DEFAULT 76" },
      { name: "gender", type: "TEXT DEFAULT 'male'" },
      { name: "fitness_goal", type: "TEXT DEFAULT 'maintenance'" },
      { name: "body_shape", type: "TEXT DEFAULT 'mesomorph'" }
    ];

    for (const col of colsToMigrate) {
      try {
        await db.runAsync(`ALTER TABLE users ADD COLUMN ${col.name} ${col.type};`);
        console.log(`Migration: Added column ${col.name} to users table.`);
      } catch (e) {
        if (!e.message.includes('duplicate column name') && !e.message.includes('already exists')) {
          console.error(`Migration error adding ${col.name}:`, e.message);
        }
      }
    }

    // Classes table
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS classes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        trainer TEXT NOT NULL,
        schedule TEXT NOT NULL,
        capacity INTEGER NOT NULL,
        enrolled INTEGER DEFAULT 0,
        duration TEXT NOT NULL,
        intensity TEXT NOT NULL,
        description TEXT NOT NULL
      )
    `);

    // Bookings table
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        class_id INTEGER NOT NULL,
        booking_date TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
        UNIQUE(user_id, class_id)
      )
    `);

    // Progress logs table
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        date TEXT NOT NULL,
        weight REAL NOT NULL,
        body_fat REAL,
        workout_duration INTEGER NOT NULL,
        heart_rate INTEGER,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    console.log('Database tables created successfully.');

    // Seed initial data
    await seedData();

  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

async function seedData() {
  try {
    // Check if users exist, seed default admin
    const adminCheck = await db.getAsync('SELECT * FROM users WHERE username = ?', ['admin']);
    if (!adminCheck) {
      const adminPasswordHash = await bcrypt.hash('admin123', 10);
      await db.runAsync(`
        INSERT INTO users (username, email, password_hash, role, membership_tier, membership_status)
        VALUES (?, ?, ?, ?, ?, ?)
      `, ['admin', 'admin@optimus.com', adminPasswordHash, 'admin', 'VIP', 'Active']);
      console.log('Seed: Created default admin user (admin / admin123)');
    }

    // Check if classes exist, seed default classes
    const classesCheck = await db.getAsync('SELECT COUNT(*) as count FROM classes');
    if (classesCheck.count === 0) {
      const defaultClasses = [
        {
          title: 'Powerlifting Fundamentals',
          trainer: 'Marcus Steel',
          schedule: 'Mon, Wed, Fri - 7:00 AM',
          capacity: 12,
          duration: '60 mins',
          intensity: 'High',
          description: 'Master the barbell bench press, squat, and deadlift. Focuses on heavy lifting, clean form, and neurological strength development.'
        },
        {
          title: 'Vinyasa Flow Yoga',
          trainer: 'Elena Rose',
          schedule: 'Tue, Thu - 9:00 AM',
          capacity: 20,
          duration: '75 mins',
          intensity: 'Low',
          description: 'A beautiful blend of breath control, mental mindfulness, dynamic movements, and restorative stretching to improve flexibility.'
        },
        {
          title: 'HIIT & Core Burn',
          trainer: 'Jackson Jax',
          schedule: 'Mon, Thu - 6:00 PM',
          capacity: 15,
          duration: '45 mins',
          intensity: 'High',
          description: 'High-intensity interval training designed to accelerate metabolism, maximize cardiovascular load, and target the abdominal wall.'
        },
        {
          title: 'Hybrid Conditioning',
          trainer: 'Coach Sarah',
          schedule: 'Sat - 10:00 AM',
          capacity: 25,
          duration: '90 mins',
          intensity: 'Medium',
          description: 'A full-body athletic workout combining aerobic energy systems, functional agility drills, and mid-range muscular endurance training.'
        }
      ];

      for (const c of defaultClasses) {
        await db.runAsync(`
          INSERT INTO classes (title, trainer, schedule, capacity, enrolled, duration, intensity, description)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [c.title, c.trainer, c.schedule, c.capacity, 0, c.duration, c.intensity, c.description]);
      }
      console.log('Seed: Created default classes.');
    }

  } catch (error) {
    console.error('Error seeding data:', error);
  }
}

module.exports = {
  db,
  initDatabase
};
