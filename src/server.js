const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const path = require('path');
const { db, initDatabase } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Database Tables and Seeds
initDatabase();

// Middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Express Session configuration
app.use(session({
  secret: 'optimus_fitness_core_secret_998811',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    secure: false // Set to true if running over HTTPS
  }
}));

// Serve Static Frontend Assets
app.use(express.static(path.join(__dirname, 'public')));

// Authentication Middleware
function requireAuth(req, res, next) {
  if (req.session && req.session.userId) {
    next();
  } else {
    res.status(401).json({ error: 'Authentication required. Please login.' });
  }
}

function requireAdmin(req, res, next) {
  if (req.session && req.session.userId && req.session.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Access denied. Administrator privileges required.' });
  }
}

/* =========================================================================
   AUTHENTICATION API
   ========================================================================= */

// User Registration
app.post('/api/auth/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Please enter all required fields.' });
  }

  try {
    // Check if user already exists
    const existingUser = await db.getAsync('SELECT * FROM users WHERE username = ? OR email = ?', [username, email]);
    if (existingUser) {
      return res.status(400).json({ error: 'Username or email is already registered.' });
    }

    // Hash Password
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert User
    await db.runAsync(`
      INSERT INTO users (username, email, password_hash, role, membership_tier, membership_status)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [username, email, passwordHash, 'member', 'None', 'Inactive']);

    // Log the user in directly after registering
    const user = await db.getAsync('SELECT id, username, email, role, membership_tier, membership_status FROM users WHERE username = ?', [username]);
    req.session.userId = user.id;
    req.session.username = user.username;
    req.session.role = user.role;

    res.status(201).json({ message: 'Registration successful!', user });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ error: 'Internal server error during registration.' });
  }
});

// User Login
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Please enter both username and password.' });
  }

  try {
    const user = await db.getAsync('SELECT * FROM users WHERE username = ?', [username]);
    if (!user) {
      return res.status(400).json({ error: 'Invalid username or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid username or password.' });
    }

    // Set Session
    req.session.userId = user.id;
    req.session.username = user.username;
    req.session.role = user.role;

    const userResponse = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      membership_tier: user.membership_tier,
      membership_status: user.membership_status,
      joined_date: user.joined_date
    };

    res.json({ message: 'Login successful!', user: userResponse });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ error: 'Internal server error during login.' });
  }
});

// User Logout
app.post('/api/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to destroy session.' });
    }
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out successfully.' });
  });
});

// Check Authentication Status / Fetch Current Profile
app.get('/api/auth/me', async (req, res) => {
  if (req.session && req.session.userId) {
    try {
      const user = await db.getAsync(
        'SELECT id, username, email, role, membership_tier, membership_status, joined_date, age, height, weight, gender, fitness_goal, body_shape FROM users WHERE id = ?',
        [req.session.userId]
      );
      if (!user) {
        return res.status(404).json({ error: 'User session active, but user not found.' });
      }
      res.json({ user });
    } catch (error) {
      res.status(500).json({ error: 'Failed to verify session profile.' });
    }
  } else {
    res.json({ user: null });
  }
});

/* =========================================================================
   CLASSES API
   ========================================================================= */

// Retrieve Classes list
app.get('/api/classes', async (req, res) => {
  try {
    const userId = req.session ? req.session.userId : null;
    const classes = await db.allAsync('SELECT * FROM classes');

    if (userId) {
      // Annotate classes if current logged-in user booked them
      const bookings = await db.allAsync('SELECT class_id FROM bookings WHERE user_id = ?', [userId]);
      const bookedIds = bookings.map(b => b.class_id);
      classes.forEach(c => {
        c.isBooked = bookedIds.includes(c.id);
      });
    } else {
      classes.forEach(c => {
        c.isBooked = false;
      });
    }

    res.json(classes);
  } catch (error) {
    console.error('Fetch Classes Error:', error);
    res.status(500).json({ error: 'Failed to load fitness classes.' });
  }
});

// Book a Class Slot
app.post('/api/classes/book', requireAuth, async (req, res) => {
  const { classId } = req.body;
  const userId = req.session.userId;

  if (!classId) {
    return res.status(400).json({ error: 'Class ID is required.' });
  }

  try {
    // Verify membership status (require active membership)
    const user = await db.getAsync('SELECT membership_status, membership_tier FROM users WHERE id = ?', [userId]);
    if (!user || user.membership_status !== 'Active') {
      return res.status(403).json({ error: 'Booking denied. You must have an active membership. Go to plans to activate.' });
    }

    // Verify class exists and check capacity
    const gymClass = await db.getAsync('SELECT * FROM classes WHERE id = ?', [classId]);
    if (!gymClass) {
      return res.status(404).json({ error: 'Requested class was not found.' });
    }

    if (gymClass.enrolled >= gymClass.capacity) {
      return res.status(400).json({ error: 'This class has reached full capacity.' });
    }

    // Check if duplicate booking
    const duplicate = await db.getAsync('SELECT * FROM bookings WHERE user_id = ? AND class_id = ?', [userId, classId]);
    if (duplicate) {
      return res.status(400).json({ error: 'You are already registered for this class.' });
    }

    // Insert booking
    await db.runAsync('INSERT INTO bookings (user_id, class_id) VALUES (?, ?)', [userId, classId]);

    // Increment enrolled counter
    await db.runAsync('UPDATE classes SET enrolled = enrolled + 1 WHERE id = ?', [classId]);

    res.json({ message: 'Class booked successfully!', classId });
  } catch (error) {
    console.error('Booking Error:', error);
    res.status(500).json({ error: 'Failed to process class booking.' });
  }
});

// Cancel a Booked Class
app.post('/api/classes/cancel', requireAuth, async (req, res) => {
  const { classId } = req.body;
  const userId = req.session.userId;

  if (!classId) {
    return res.status(400).json({ error: 'Class ID is required.' });
  }

  try {
    // Check if booking exists
    const booking = await db.getAsync('SELECT * FROM bookings WHERE user_id = ? AND class_id = ?', [userId, classId]);
    if (!booking) {
      return res.status(404).json({ error: 'No active booking found for this class.' });
    }

    // Delete booking
    await db.runAsync('DELETE FROM bookings WHERE user_id = ? AND class_id = ?', [userId, classId]);

    // Decrement enrolled counter
    await db.runAsync('UPDATE classes SET enrolled = MAX(0, enrolled - 1) WHERE id = ?', [classId]);

    res.json({ message: 'Booking cancelled successfully.', classId });
  } catch (error) {
    console.error('Cancellation Error:', error);
    res.status(500).json({ error: 'Failed to cancel the class booking.' });
  }
});

/* =========================================================================
   MEMBER PROGRESS & DASHBOARD API
   ========================================================================= */

// Fetch Dashboard Details (Bookings, Progress Metrics, User Details)
app.get('/api/member/dashboard', requireAuth, async (req, res) => {
  const userId = req.session.userId;

  try {
    // 1. Fetch User details
    const user = await db.getAsync(
      'SELECT id, username, email, role, membership_tier, membership_status, joined_date, age, height, weight, gender, fitness_goal, body_shape FROM users WHERE id = ?',
      [userId]
    );

    // 2. Fetch User bookings
    const bookings = await db.allAsync(`
      SELECT b.id as booking_id, c.id as class_id, c.title, c.trainer, c.schedule, c.duration, c.intensity
      FROM bookings b
      JOIN classes c ON b.class_id = c.id
      WHERE b.user_id = ?
    `, [userId]);

    // 3. Fetch user progress logs (limit to last 15 entries for graphic charting)
    const progress = await db.allAsync(`
      SELECT * FROM progress
      WHERE user_id = ?
      ORDER BY date ASC
      LIMIT 15
    `, [userId]);

    res.json({
      user,
      bookings,
      progress
    });
  } catch (error) {
    console.error('Dashboard Data Fetch Error:', error);
    res.status(500).json({ error: 'Failed to retrieve member dashboard metrics.' });
  }
});

// Add Workout Progress Log
app.post('/api/member/progress', requireAuth, async (req, res) => {
  const userId = req.session.userId;
  const { date, weight, bodyFat, duration, heartRate } = req.body;

  if (!date || !weight || !duration) {
    return res.status(400).json({ error: 'Date, Weight, and Workout Duration are required.' });
  }

  try {
    await db.runAsync(`
      INSERT INTO progress (user_id, date, weight, body_fat, workout_duration, heart_rate)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [userId, date, parseFloat(weight), bodyFat ? parseFloat(bodyFat) : null, parseInt(duration), heartRate ? parseInt(heartRate) : null]);

    // Sync weight parameter with users base profile table
    await db.runAsync('UPDATE users SET weight = ? WHERE id = ?', [parseFloat(weight), userId]);

    res.status(200).json({ message: 'Progress log submitted successfully!' });
  } catch (error) {
    console.error('Log Progress Error:', error);
    res.status(500).json({ error: 'Failed to record workout stats.' });
  }
});

// Update/Purchase Membership Tier
app.post('/api/member/membership', requireAuth, async (req, res) => {
  const userId = req.session.userId;
  const { tier } = req.body;

  const validTiers = ['Basic', 'Elite', 'VIP'];
  if (!validTiers.includes(tier)) {
    return res.status(400).json({ error: 'Invalid membership tier chosen.' });
  }

  try {
    await db.runAsync(`
      UPDATE users
      SET membership_tier = ?, membership_status = 'Active'
      WHERE id = ?
    `, [tier, userId]);

    // Fetch updated user
    const user = await db.getAsync(
      'SELECT id, username, email, role, membership_tier, membership_status FROM users WHERE id = ?',
      [userId]
    );

    res.json({ message: `Successfully enrolled in the ${tier} membership package!`, user });
  } catch (error) {
    console.error('Membership Purchase Error:', error);
    res.status(500).json({ error: 'Failed to upgrade membership plan.' });
  }
});

// Update Biometric Profile Details
app.post('/api/member/profile', requireAuth, async (req, res) => {
  const userId = req.session.userId;
  const { age, height, weight, gender, goal, bodyShape } = req.body;

  if (!age || !height || !weight || !gender || !goal || !bodyShape) {
    return res.status(400).json({ error: 'All biometric specifications must be provided.' });
  }

  try {
    await db.runAsync(`
      UPDATE users
      SET age = ?, height = ?, weight = ?, gender = ?, fitness_goal = ?, body_shape = ?
      WHERE id = ?
    `, [parseInt(age), parseFloat(height), parseFloat(weight), gender, goal, bodyShape, userId]);

    // Fetch updated user profile
    const user = await db.getAsync(
      'SELECT id, username, email, role, membership_tier, membership_status, joined_date, age, height, weight, gender, fitness_goal, body_shape FROM users WHERE id = ?',
      [userId]
    );

    res.json({ message: 'Dynamic bio-profile updated successfully!', user });
  } catch (error) {
    console.error('Profile Update Error:', error);
    res.status(500).json({ error: 'Failed to record biometrics updates in database.' });
  }
});

/* =========================================================================
   ADMIN API (Protected)
   ========================================================================= */

// Get Admin Dashboard Overview
app.get('/api/admin/overview', requireAdmin, async (req, res) => {
  try {
    const totalUsers = await db.getAsync("SELECT COUNT(*) as count FROM users WHERE role = 'member'");
    const activeMembers = await db.getAsync("SELECT COUNT(*) as count FROM users WHERE membership_status = 'Active' AND role = 'member'");
    const totalClasses = await db.getAsync("SELECT COUNT(*) as count FROM classes");
    const totalBookings = await db.getAsync("SELECT COUNT(*) as count FROM bookings");
    
    // Member list
    const members = await db.allAsync(`
      SELECT id, username, email, membership_tier, membership_status, joined_date
      FROM users
      WHERE role = 'member'
      ORDER BY joined_date DESC
    `);

    // Tier distribution
    const tiers = await db.allAsync(`
      SELECT membership_tier, COUNT(*) as count
      FROM users
      WHERE role = 'member'
      GROUP BY membership_tier
    `);

    res.json({
      stats: {
        totalUsers: totalUsers.count,
        activeMembers: activeMembers.count,
        totalClasses: totalClasses.count,
        totalBookings: totalBookings.count
      },
      members,
      tiers
    });
  } catch (error) {
    console.error('Admin Overview Error:', error);
    res.status(500).json({ error: 'Failed to load administrator statistics.' });
  }
});

// Admin Add Class
app.post('/api/admin/classes', requireAdmin, async (req, res) => {
  const { title, trainer, schedule, capacity, duration, intensity, description } = req.body;

  if (!title || !trainer || !schedule || !capacity || !duration || !intensity || !description) {
    return res.status(400).json({ error: 'All fields are required to create a new gym class.' });
  }

  try {
    await db.runAsync(`
      INSERT INTO classes (title, trainer, schedule, capacity, duration, intensity, description)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [title, trainer, schedule, parseInt(capacity), duration, intensity, description]);

    res.status(201).json({ message: 'Gym class successfully added!' });
  } catch (error) {
    console.error('Admin Add Class Error:', error);
    res.status(500).json({ error: 'Failed to register the new class.' });
  }
});

// Admin Delete Class
app.delete('/api/admin/classes/:id', requireAdmin, async (req, res) => {
  const classId = req.params.id;

  try {
    // Delete booking dependencies will trigger cascade automatically if configured, otherwise we'll run deletion
    await db.runAsync('DELETE FROM classes WHERE id = ?', [classId]);
    res.json({ message: 'Gym class deleted successfully.' });
  } catch (error) {
    console.error('Admin Delete Class Error:', error);
    res.status(500).json({ error: 'Failed to delete the gym class.' });
  }
});

// Fallback: Redirect index route to default index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`   OPTIMUS FITNESS RUNNING SUCCESSFULLY ON PORT ${PORT}`);
  console.log(`   Local Server Access: http://localhost:${PORT}`);
  console.log(`======================================================\n`);
});
