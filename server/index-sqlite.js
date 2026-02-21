import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import db, { initializeDatabase } from './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ Created uploads directory:', uploadsDir);
}

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Initialize database
initializeDatabase();

// Create default admin user if none exists
const createDefaultAdmin = async () => {
  try {
    const users = db.prepare('SELECT * FROM users').all();
    if (users.length === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      db.prepare(`
        INSERT INTO users (username, password, name, email, phone, pin)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run('admin', hashedPassword, 'Administrator', 'admin@feedxnexus.com', '0000000000', '0000');
      console.log('✅ Default admin user created (username: admin, password: admin123)');
    }
  } catch (error) {
    console.error('Error creating default admin:', error);
  }
};

createDefaultAdmin();

// Middleware
app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:3000', 'http://127.0.0.1:8080', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '..', 'public', 'uploads')));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'public', 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'video/mp4',
      'video/avi',
      'video/mov',
      'video/wmv',
      'video/flv',
      'video/webm',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'application/zip',
      'application/x-rar-compressed',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type'), false);
    }
  }
});

// ================== AUTH MIDDLEWARE ==================
const verifyToken = (req, res, next) => {
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

// File upload endpoint with error handling for multer
app.post('/api/upload', verifyToken, (req, res) => {
  upload.single('file')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      console.error('Multer error:', err);
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File too large. Maximum size is 100MB.' });
      }
      return res.status(400).json({ error: `Upload error: ${err.message}` });
    } else if (err) {
      console.error('Upload error:', err);
      return res.status(400).json({ error: err.message || 'Failed to upload file' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('File uploaded successfully:', req.file.filename);
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({
      url: fileUrl,
      filename: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
  });
});

// ================== AUTH ROUTES ==================

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const user = db.prepare('SELECT * FROM users WHERE username = ? OR email = ?').get(username, username);

    if (!user) {
      db.prepare('INSERT INTO login_logs (username, ip_address, success) VALUES (?, ?, ?)').run(username, req.ip, 0);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      db.prepare('INSERT INTO login_logs (username, ip_address, success) VALUES (?, ?, ?)').run(username, req.ip, 0);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Log successful login
    db.prepare('INSERT INTO login_logs (username, ip_address, success) VALUES (?, ?, ?)').run(username, req.ip, 1);

    const token = jwt.sign({ id: user.id, username: user.username, name: user.name }, JWT_SECRET, { expiresIn: '24h' });

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, username: user.username, name: user.name, email: user.email }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Register (protected)
app.post('/api/auth/register', verifyToken, async (req, res) => {
  try {
    const { username, password, name, email, phone, pin } = req.body;
    if (!username || !password || !name || !email || !phone || !pin) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = db.prepare(`
      INSERT INTO users (username, password, name, email, phone, pin)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(username, hashedPassword, name, email, phone, pin);

    res.status(201).json({
      message: 'User created successfully',
      user: { id: result.lastInsertRowid, username, name, email }
    });
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Verify token endpoint
app.get('/api/auth/verify', verifyToken, (req, res) => {
  res.json({ valid: true, user: req.user });
});

// Get all users
app.get('/api/auth/users', verifyToken, (req, res) => {
  try {
    const users = db.prepare('SELECT id, username, name, email, phone, created_at FROM users').all();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get login logs
app.get('/api/auth/login-logs', verifyToken, (req, res) => {
  try {
    const { username } = req.query;
    let logs;
    if (username) {
      logs = db.prepare('SELECT * FROM login_logs WHERE username = ? ORDER BY login_time DESC LIMIT 100').all(username);
    } else {
      logs = db.prepare('SELECT * FROM login_logs ORDER BY login_time DESC LIMIT 100').all();
    }
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

// Delete user
app.delete('/api/auth/users/:id', verifyToken, (req, res) => {
  try {
    db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// ================== NOTIFICATIONS ==================
app.get('/api/admin/notifications', verifyToken, (req, res) => {
  try {
    const notifications = db.prepare('SELECT * FROM notifications ORDER BY timestamp DESC').all();
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

app.post('/api/admin/notifications', verifyToken, (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    const id = `notification-${Date.now()}`;
    db.prepare('INSERT INTO notifications (id, title, description) VALUES (?, ?, ?)').run(id, title, description);

    const notification = db.prepare('SELECT * FROM notifications WHERE id = ?').get(id);
    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create notification' });
  }
});

app.delete('/api/admin/notifications/:id', verifyToken, (req, res) => {
  try {
    db.prepare('DELETE FROM notifications WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

// ================== UPDATES ==================
app.get('/api/admin/updates', verifyToken, (req, res) => {
  try {
    const updates = db.prepare('SELECT * FROM updates ORDER BY timestamp DESC').all();
    res.json(updates.map(u => ({
      ...u,
      images: u.images ? JSON.parse(u.images) : []
    })));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch updates' });
  }
});

app.post('/api/admin/updates', verifyToken, (req, res) => {
  try {
    const { title, description, images, priority } = req.body;
    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    const id = `update-${Date.now()}`;
    const imagesJson = JSON.stringify(images || []);
    db.prepare('INSERT INTO updates (id, title, description, images, priority) VALUES (?, ?, ?, ?, ?)').run(id, title, description, imagesJson, priority || 'medium');

    const update = db.prepare('SELECT * FROM updates WHERE id = ?').get(id);
    res.status(201).json({
      ...update,
      images: update.images ? JSON.parse(update.images) : []
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create update' });
  }
});

app.delete('/api/admin/updates/:id', verifyToken, (req, res) => {
  try {
    db.prepare('DELETE FROM updates WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete update' });
  }
});

// ================== RESOURCES ==================
app.get('/api/admin/resources', verifyToken, (req, res) => {
  try {
    const resources = db.prepare('SELECT * FROM resources ORDER BY timestamp DESC').all();
    res.json(resources.map(r => ({
      ...r,
      tags: r.tags ? JSON.parse(r.tags) : [],
      files: r.files ? JSON.parse(r.files) : [],
      images: r.images ? JSON.parse(r.images) : [],
      longDescription: r.long_description
    })));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch resources' });
  }
});

app.get('/api/admin/resources/:id', verifyToken, (req, res) => {
  try {
    const resource = db.prepare('SELECT * FROM resources WHERE id = ?').get(req.params.id);
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }
    res.json({
      ...resource,
      tags: resource.tags ? JSON.parse(resource.tags) : [],
      files: resource.files ? JSON.parse(resource.files) : [],
      images: resource.images ? JSON.parse(resource.images) : [],
      longDescription: resource.long_description
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch resource' });
  }
});

app.post('/api/admin/resources', verifyToken, (req, res) => {
  try {
    const { title, description, longDescription, tags, files, images } = req.body;
    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    const id = `resource-${Date.now()}`;
    const tagsJson = JSON.stringify(tags || []);
    const filesJson = JSON.stringify(files || []);
    const imagesJson = JSON.stringify(images || []);

    db.prepare('INSERT INTO resources (id, title, description, long_description, tags, files, images) VALUES (?, ?, ?, ?, ?, ?, ?)').run(id, title, description, longDescription || '', tagsJson, filesJson, imagesJson);

    const resource = db.prepare('SELECT * FROM resources WHERE id = ?').get(id);
    res.status(201).json({
      ...resource,
      tags: JSON.parse(resource.tags),
      files: JSON.parse(resource.files),
      images: JSON.parse(resource.images),
      longDescription: resource.long_description
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create resource' });
  }
});

app.delete('/api/admin/resources/:id', verifyToken, (req, res) => {
  try {
    db.prepare('DELETE FROM resources WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete resource' });
  }
});

// ================== EVENTS ==================
app.get('/api/admin/events', verifyToken, (req, res) => {
  try {
    const events = db.prepare('SELECT * FROM events ORDER BY timestamp DESC').all();
    res.json(events.map(e => ({
      ...e,
      registerLink: e.register_link,
      files: e.files ? JSON.parse(e.files) : []
    })));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

app.post('/api/admin/events', verifyToken, (req, res) => {
  try {
    const { title, description, image, date, time, location, registerLink, files } = req.body;
    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    const id = `event-${Date.now()}`;
    const filesJson = JSON.stringify(files || []);
    db.prepare('INSERT INTO events (id, title, description, image, date, time, location, register_link, files) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').run(id, title, description, image || '', date || '', time || '', location || '', registerLink || '', filesJson);

    const event = db.prepare('SELECT * FROM events WHERE id = ?').get(id);
    res.status(201).json({
      ...event,
      registerLink: event.register_link,
      files: JSON.parse(event.files || '[]')
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create event' });
  }
});

app.delete('/api/admin/events/:id', verifyToken, (req, res) => {
  try {
    db.prepare('DELETE FROM events WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

// ================== SPOTLIGHT ==================
app.get('/api/admin/spotlight', verifyToken, (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50; // Default limit of 50
    const spotlight = db.prepare('SELECT * FROM spotlight ORDER BY timestamp DESC LIMIT ?').all(limit);
    res.json(spotlight.map(s => ({
      ...s,
      images: s.images ? JSON.parse(s.images) : []
    })));
  } catch (error) {
    console.error('Error fetching spotlight:', error);
    res.status(500).json({ error: 'Failed to fetch spotlight' });
  }
});

app.post('/api/admin/spotlight', verifyToken, (req, res) => {
  try {
    const { title, description, images } = req.body;
    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    const id = `spotlight-${Date.now()}`;
    const imagesJson = JSON.stringify(images || []);
    db.prepare('INSERT INTO spotlight (id, title, description, images) VALUES (?, ?, ?, ?)').run(id, title, description, imagesJson);

    const item = db.prepare('SELECT * FROM spotlight WHERE id = ?').get(id);
    res.status(201).json({
      ...item,
      images: JSON.parse(item.images)
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create spotlight' });
  }
});

app.delete('/api/admin/spotlight/:id', verifyToken, (req, res) => {
  try {
    db.prepare('DELETE FROM spotlight WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete spotlight' });
  }
});

// ================== TESTIMONIALS ==================
app.get('/api/admin/testimonials', verifyToken, (req, res) => {
  try {
    const testimonials = db.prepare('SELECT * FROM testimonials ORDER BY timestamp DESC').all();
    res.json(testimonials);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch testimonials' });
  }
});

// ================== PUBLIC ROUTES (No Auth Required) ==================
app.get('/api/notifications', (req, res) => {
  try {
    const notifications = db.prepare('SELECT * FROM notifications ORDER BY timestamp DESC').all();
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

app.get('/api/updates', (req, res) => {
  try {
    const updates = db.prepare('SELECT * FROM updates ORDER BY timestamp DESC').all();
    res.json(updates.map(u => ({
      ...u,
      images: u.images ? JSON.parse(u.images) : []
    })));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch updates' });
  }
});

app.get('/api/events', (req, res) => {
  try {
    const events = db.prepare('SELECT * FROM events ORDER BY timestamp DESC').all();
    res.json(events.map(e => ({
      ...e,
      registerLink: e.register_link,
      files: e.files ? JSON.parse(e.files) : []
    })));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

app.get('/api/testimonials', (req, res) => {
  try {
    const testimonials = db.prepare('SELECT * FROM testimonials ORDER BY timestamp DESC').all();
    res.json(testimonials);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch testimonials' });
  }
});

app.get('/api/resources', (req, res) => {
  try {
    const resources = db.prepare('SELECT * FROM resources ORDER BY timestamp DESC').all();
    res.json(resources.map(r => ({
      ...r,
      tags: r.tags ? JSON.parse(r.tags) : [],
      files: r.files ? JSON.parse(r.files) : [],
      images: r.images ? JSON.parse(r.images) : [],
      longDescription: r.long_description
    })));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch resources' });
  }
});

app.get('/api/resources/:id', (req, res) => {
  try {
    const resource = db.prepare('SELECT * FROM resources WHERE id = ?').get(req.params.id);
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }
    res.json({
      ...resource,
      tags: resource.tags ? JSON.parse(resource.tags) : [],
      files: resource.files ? JSON.parse(resource.files) : [],
      images: resource.images ? JSON.parse(resource.images) : [],
      longDescription: resource.long_description
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch resource' });
  }
});

app.get('/api/spotlight', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const spotlight = db.prepare('SELECT * FROM spotlight ORDER BY timestamp DESC LIMIT ?').all(limit);
    res.json(spotlight.map(s => ({
      ...s,
      images: s.images ? JSON.parse(s.images) : []
    })));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch spotlight' });
  }
});

app.post('/api/admin/testimonials', verifyToken, (req, res) => {
  try {
    const { name, title, content, image } = req.body;
    if (!name || !title || !content) {
      return res.status(400).json({ error: 'Name, title, and content are required' });
    }

    const id = `testimonial-${Date.now()}`;
    db.prepare('INSERT INTO testimonials (id, name, title, content, image) VALUES (?, ?, ?, ?, ?)').run(id, name, title, content, image || '');

    const testimonial = db.prepare('SELECT * FROM testimonials WHERE id = ?').get(id);
    res.status(201).json(testimonial);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create testimonial' });
  }
});

app.delete('/api/admin/testimonials/:id', verifyToken, (req, res) => {
  try {
    db.prepare('DELETE FROM testimonials WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete testimonial' });
  }
});

// ================== GALLERY ==================
// Get all gallery images (public)
app.get('/api/gallery', (req, res) => {
  try {
    const images = db.prepare('SELECT * FROM gallery ORDER BY `order` ASC').all();
    res.json(images);
  } catch (error) {
    console.error('Error fetching gallery:', error);
    res.status(500).json({ error: 'Failed to fetch gallery images' });
  }
});

// Create gallery image (protected)
app.post('/api/gallery', verifyToken, (req, res) => {
  try {
    const { url, order } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    const id = `gallery-${Date.now()}`;
    db.prepare('INSERT INTO gallery (id, url, `order`) VALUES (?, ?, ?)').run(id, url, order || 1);

    const image = db.prepare('SELECT * FROM gallery WHERE id = ?').get(id);
    res.status(201).json(image);
  } catch (error) {
    console.error('Error creating gallery image:', error);
    res.status(500).json({ error: 'Failed to create gallery image' });
  }
});

// Delete gallery image (protected)
app.delete('/api/gallery/:id', verifyToken, (req, res) => {
  try {
    db.prepare('DELETE FROM gallery WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Error deleting gallery image:', error);
    res.status(500).json({ error: 'Failed to delete gallery image' });
  }
});

// Reorder gallery images (protected)
app.put('/api/gallery/reorder', verifyToken, (req, res) => {
  try {
    const images = req.body;
    if (!Array.isArray(images)) {
      return res.status(400).json({ error: 'Invalid data format' });
    }

    // Update order for each image
    const updateStmt = db.prepare('UPDATE gallery SET `order` = ? WHERE id = ?');
    const updateMany = db.transaction((images) => {
      for (const img of images) {
        updateStmt.run(img.order, img.id);
      }
    });
    updateMany(images);

    res.json({ success: true, message: 'Gallery reordered successfully' });
  } catch (error) {
    console.error('Error reordering gallery:', error);
    res.status(500).json({ error: 'Failed to reorder gallery images' });
  }
});

// ================== CRAWLER ==================
app.get('/api/crawler/gioe', verifyToken, async (req, res) => {
  try {
    const cachedData = {
      url: 'https://gioe.netlify.app/',
      title: 'GIOE - Global Institute of Excellence',
      fetched_at: new Date().toISOString(),
      sections: {
        announcements: [
          { title: 'Welcome to GIOE', description: 'Global Institute of Excellence', date: new Date().toISOString() }
        ],
        opportunities: [
          { title: 'Internship Opportunities', company: 'GIOE', description: 'Join our team' }
        ],
        events: [
          { title: 'Monthly Webinar', date: new Date().toISOString(), location: 'Online' }
        ]
      }
    };
    res.json(cachedData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to crawl website' });
  }
});

// ================== ATTENDANCE API (existing) ==================
app.post('/api/attendance', async (req, res) => {
  try {
    const { htno, dob, current_semester, branch_code } = req.body;

    if (!htno || !dob || !current_semester || !branch_code) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const attendance_data = {
      overall_attendance: 85,
      subjects: [
        { name: 'Subject 1', attendance: 90, total_classes: 40, attended: 36 },
        { name: 'Subject 2', attendance: 80, total_classes: 35, attended: 28 }
      ]
    };

    res.json(attendance_data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch attendance' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  console.log(`✅ SQLite database ready`);
  console.log(`✅ Default admin: username=admin, password=admin123`);
});
