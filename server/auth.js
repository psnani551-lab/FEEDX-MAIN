import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from './database.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware to verify JWT token
export const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Login endpoint
router.post('/login', (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Get user from database
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);

    if (!user) {
      // Log failed login
      const ipAddress = req.ip;
      db.prepare(
        'INSERT INTO login_logs (username, ip_address, success) VALUES (?, ?, ?)'
      ).run(username, ipAddress, 0);

      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const passwordMatch = bcrypt.compareSync(password, user.password);

    if (!passwordMatch) {
      // Log failed login
      const ipAddress = req.ip;
      db.prepare(
        'INSERT INTO login_logs (username, ip_address, success) VALUES (?, ?, ?)'
      ).run(username, ipAddress, 0);

      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Log successful login
    const ipAddress = req.ip;
    db.prepare(
      'INSERT INTO login_logs (username, ip_address, success) VALUES (?, ?, ?)'
    ).run(username, ipAddress, 1);

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username, name: user.name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Register endpoint (only accessible after first admin login)
router.post('/register', verifyToken, (req, res) => {
  try {
    const { username, password, name, email, phone, pin } = req.body;

    // Validate required fields
    if (!username || !password || !name || !email || !phone || !pin) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if username already exists
    const existingUser = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Check if email already exists
    const existingEmail = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (existingEmail) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Hash password
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Insert new user
    const result = db.prepare(
      'INSERT INTO users (username, password, name, email, phone, pin) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(username, hashedPassword, name, email, phone, pin);

    // Log admin action
    db.prepare(
      'INSERT INTO admin_logs (username, action, resource_type) VALUES (?, ?, ?)'
    ).run(req.user.username, 'CREATE_USER', 'user');

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: result.lastInsertRowid,
        username,
        name,
        email,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Get all users (admin only)
router.get('/users', verifyToken, (req, res) => {
  try {
    const users = db.prepare(
      'SELECT id, username, name, email, phone, created_at FROM users ORDER BY created_at DESC'
    ).all();

    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get login logs
router.get('/login-logs', verifyToken, (req, res) => {
  try {
    const { username } = req.query;
    let query = 'SELECT * FROM login_logs ORDER BY login_time DESC LIMIT 100';
    let params = [];

    if (username) {
      query = 'SELECT * FROM login_logs WHERE username = ? ORDER BY login_time DESC LIMIT 100';
      params = [username];
    }

    const logs = db.prepare(query).all(...params);
    res.json(logs);
  } catch (error) {
    console.error('Get login logs error:', error);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

// Get admin logs
router.get('/admin-logs', verifyToken, (req, res) => {
  try {
    const logs = db.prepare(
      'SELECT * FROM admin_logs ORDER BY created_at DESC LIMIT 100'
    ).all();

    res.json(logs);
  } catch (error) {
    console.error('Get admin logs error:', error);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

// Delete user (admin only)
router.delete('/users/:id', verifyToken, (req, res) => {
  try {
    const { id } = req.params;

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    db.prepare('DELETE FROM users WHERE id = ?').run(id);

    // Log admin action
    db.prepare(
      'INSERT INTO admin_logs (username, action, resource_type, resource_id) VALUES (?, ?, ?, ?)'
    ).run(req.user.username, 'DELETE_USER', 'user', id);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

export default router;
