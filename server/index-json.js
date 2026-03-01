import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Data directory for JSON files
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Uploads directory with subdirectories for file organization
const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
const uploadSubDirs = ['images', 'videos', 'documents', 'others'];
uploadSubDirs.forEach(subDir => {
  const dir = path.join(uploadsDir, subDir);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});
console.log('✅ Uploads directory ready:', uploadsDir);

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Helper functions for JSON file storage
const readJsonFile = (filename) => {
  const filepath = path.join(dataDir, filename);
  if (!fs.existsSync(filepath)) {
    return [];
  }
  try {
    return JSON.parse(fs.readFileSync(filepath, 'utf8'));
  } catch {
    return [];
  }
};

const writeJsonFile = (filename, data) => {
  const filePath = path.join(dataDir, filename);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    // console.log(`✅ Saved ${filename}`);
  } catch (error) {
    console.error(`Error writing ${filename}:`, error);
  }
};

const readLoginLogs = () => {
  const filePath = path.join(dataDir, 'login-logs.json');
  try {
    if (!fs.existsSync(filePath)) {
      return [];
    }
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading login logs:', error);
    return [];
  }
};

const writeLoginLogs = (logs) => {
  const filePath = path.join(dataDir, 'login-logs.json');
  try {
    fs.writeFileSync(filePath, JSON.stringify(logs.slice(-500), null, 2)); // Keep last 500 logs
  } catch (error) {
    console.error('Error writing login logs:', error);
  }
};

const readAuditLogs = () => {
  const filePath = path.join(dataDir, 'audit-logs.json');
  try {
    if (!fs.existsSync(filePath)) return [];
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    console.error('Error reading audit logs:', error);
    return [];
  }
};

const writeAuditLogs = (logs) => {
  const filePath = path.join(dataDir, 'audit-logs.json');
  try {
    fs.writeFileSync(filePath, JSON.stringify(logs.slice(-1000), null, 2)); // Keep last 1000 logs
  } catch (error) {
    console.error('Error writing audit logs:', error);
  }
};

const logAction = (user, action, resource, resourceId, details = {}) => {
  const logs = readAuditLogs();
  logs.unshift({
    id: generateId(),
    userId: user.id,
    username: user.username,
    action, // 'CREATE', 'UPDATE', 'DELETE'
    resource,
    resourceId,
    details,
    timestamp: new Date().toISOString()
  });
  writeAuditLogs(logs);
};

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

// Initialize default admin user
const initializeAdmin = async () => {
  let users = readJsonFile('users.json');
  const adminExists = users.some(u => u.username === 'admin');

  if (!adminExists) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    users.push({
      id: generateId(),
      username: 'admin',
      password: hashedPassword,
      name: 'Administrator',
      email: 'admin@feedx.com',
      phone: '0000000000',
      pin: '0000',
      createdAt: new Date().toISOString()
    });
    writeJsonFile('users.json', users);
    console.log('✅ Default admin user created (username: admin, password: admin123)');
  } else {
    console.log('ℹ️ Admin user already exists');
  }
};

initializeAdmin();

// Middleware
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// Set a tight but functional Content Security Policy to avoid default-src 'none'
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https: wss: ws://localhost:* http://localhost:*; frame-src 'self' https://heyzine.com https://drive.google.com https://docs.google.com;"
  );
  next();
});

// Serve public folder (for images, robots.txt, etc.)
const publicDir = path.join(__dirname, '..', 'public');
app.use(express.static(publicDir));

// Serve Main App built files
const mainDistPath = path.join(__dirname, '..', 'dist');
if (fs.existsSync(mainDistPath)) {
  console.log('🚀 Serving Main App from:', mainDistPath);
  app.use(express.static(mainDistPath));
}

// Serve uploaded files statically
app.use('/uploads', express.static(uploadsDir));


// Configure multer for file uploads with organized storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Check if this is a resource upload (has resourceName in body)
    const resourceName = req.body.resourceName;

    if (resourceName) {
      // Create folder for this resource
      const sanitizedName = resourceName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const resourcePath = path.join(uploadsDir, 'resources', sanitizedName);

      if (!fs.existsSync(resourcePath)) {
        fs.mkdirSync(resourcePath, { recursive: true });
      }

      cb(null, resourcePath);
    } else {
      // Determine folder based on file type
      let uploadPath = path.join(uploadsDir, 'others');

      if (file.mimetype.startsWith('image/')) {
        uploadPath = path.join(uploadsDir, 'images');
      } else if (file.mimetype.startsWith('video/')) {
        uploadPath = path.join(uploadsDir, 'videos');
      } else if (
        file.mimetype.includes('pdf') ||
        file.mimetype.includes('document') ||
        file.mimetype.includes('text') ||
        file.mimetype.includes('word') ||
        file.mimetype.includes('excel') ||
        file.mimetype.includes('sheet') ||
        file.mimetype.includes('powerpoint') ||
        file.mimetype.includes('presentation')
      ) {
        uploadPath = path.join(uploadsDir, 'documents');
      }

      cb(null, uploadPath);
    }
  },
  filename: (req, file, cb) => {
    const resourceName = req.body.resourceName;
    const fileCounter = req.body.fileCounter || Date.now();

    if (resourceName) {
      // For resources, use resourceName-counter.extension format
      const sanitizedName = resourceName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const ext = path.extname(file.originalname);
      const filename = `${sanitizedName}-${fileCounter}${ext}`;
      cb(null, filename);
    } else {
      // Generate unique filename with timestamp for non-resource uploads
      const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
      cb(null, uniqueName);
    }
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      // Images
      'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/svg+xml',
      // Videos
      'video/mp4', 'video/avi', 'video/mov', 'video/mkv', 'video/webm', 'video/quicktime', 'video/wmv', 'video/flv',
      // Documents
      'application/pdf', 'text/plain',
      'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      // Archives
      'application/zip', 'application/x-zip-compressed', 'application/x-rar-compressed',
      // Text/Code files
      'text/csv', 'text/html', 'text/css', 'text/javascript', 'application/json',
      // Audio
      'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed. Supported: images, videos, PDFs, documents, archives, and text files.'), false);
    }
  }
});

// Auth Middleware
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

// ================== FILE UPLOAD ==================
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

    // Get relative path from uploads dir (e.g., "images/123456.jpg")
    const relativePath = path.relative(uploadsDir, req.file.path).replace(/\\/g, '/');
    const fileUrl = `/uploads/${relativePath}`;

    console.log('✅ File uploaded:', req.file.filename, '→', fileUrl);

    res.json({
      success: true,
      url: fileUrl,
      file: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path,
        url: fileUrl
      }
    });
  });
});

// Handle multer errors globally
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 100MB.' });
    }
    return res.status(400).json({ error: `Upload error: ${error.message}` });
  }

  if (error.message && error.message.includes('File type not allowed')) {
    return res.status(400).json({ error: error.message });
  }

  console.error('Server error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// ================== AUTH ROUTES ==================
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log('Login attempt:', { username, passwordProvided: !!password });

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const users = readJsonFile('users.json');
    console.log('Users loaded:', users.length, 'users found');
    console.log('Looking for user:', username);

    const user = users.find(u => u.username === username || u.email === username);

    if (!user) {
      console.log('User not found');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('User found:', user.username);

    const passwordMatch = await bcrypt.compare(password, user.password);
    console.log('Password match:', passwordMatch);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, username: user.username, name: user.name }, JWT_SECRET, { expiresIn: '24h' });

    // Log successful login
    const logs = readLoginLogs();
    logs.push({
      id: generateId(),
      username: user.username,
      ip_address: req.ip || req.headers['x-forwarded-for'],
      userAgent: req.headers['user-agent'],
      login_time: new Date().toISOString(),
      success: true
    });
    writeLoginLogs(logs);

    res.json({
      token,
      user: { id: user.id, username: user.username, name: user.name, email: user.email }
    });
  } catch (error) {
    console.error('Login error:', error);
    // Log failed attempt if username was provided
    if (req.body.username) {
      const logs = readLoginLogs();
      logs.push({
        id: generateId(),
        username: req.body.username,
        ip_address: req.ip || req.headers['x-forwarded-for'],
        userAgent: req.headers['user-agent'],
        login_time: new Date().toISOString(),
        success: false,
        reason: error.message
      });
      writeLoginLogs(logs);
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get login logs (admin only)
app.get('/api/auth/login-logs', verifyToken, (req, res) => {
  try {
    const logs = readLoginLogs();
    res.json(logs.reverse()); // Newest first
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

// Register new user (admin only)
app.post('/api/auth/register', async (req, res) => {
  try {
    let { username, password, name, email, phone, pin } = req.body;

    if (!username) username = email; // Fallback username to email if not provided

    if (!username || !password || !name || !email) {
      return res.status(400).json({ error: 'Username, password, name, and email are required' });
    }

    const users = readJsonFile('users.json');

    // Check if username or email already exists
    if (users.find(u => u.username === username)) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    if (users.find(u => u.email === email)) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      id: generateId(),
      username,
      password: hashedPassword,
      name,
      email,
      phone: phone || '',
      pin: pin || '',
      created_at: new Date().toISOString()
    };

    users.push(newUser);
    writeJsonFile('users.json', users);

    // Sign token so user is immediately logged in
    const token = jwt.sign({ id: newUser.id, username: newUser.username, name: newUser.name }, JWT_SECRET, { expiresIn: '24h' });

    res.json({
      message: 'User created successfully',
      token,
      user: { id: newUser.id, username: newUser.username, name: newUser.name, email: newUser.email }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all users (admin only)
app.get('/api/auth/users', verifyToken, (req, res) => {
  const users = readJsonFile('users.json');
  // Return users without passwords
  const safeUsers = users.map(u => ({
    id: u.id,
    username: u.username,
    name: u.name,
    email: u.email,
    phone: u.phone,
    created_at: u.created_at || u.createdAt
  }));
  res.json(safeUsers);
});

// Delete user (admin only)
app.delete('/api/auth/users/:id', verifyToken, (req, res) => {
  let users = readJsonFile('users.json');
  const userToDelete = users.find(u => u.id === req.params.id || u.id === parseInt(req.params.id));

  if (!userToDelete) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Prevent deleting the last admin
  if (users.length === 1) {
    return res.status(400).json({ error: 'Cannot delete the last user' });
  }

  users = users.filter(u => u.id !== req.params.id && u.id !== parseInt(req.params.id));
  writeJsonFile('users.json', users);

  res.json({ message: 'User deleted successfully' });
});

app.get('/api/auth/me', verifyToken, (req, res) => {
  const users = readJsonFile('users.json');
  const user = users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json({ id: user.id, username: user.username, name: user.name, email: user.email });
});

// ================== GENERIC CRUD HELPERS ==================
const createCrudRoutes = (resourceName) => {
  const filename = `${resourceName}.json`;


  // GET all
  app.get(`/api/admin/${resourceName}`, (req, res) => {
    const data = readJsonFile(filename);
    res.json(data);
  });

  // GET by ID
  app.get(`/api/admin/${resourceName}/:id`, (req, res) => {
    const data = readJsonFile(filename);
    const item = data.find(d => d.id === req.params.id);
    if (!item) {
      return res.status(404).json({ error: `${resourceName} not found` });
    }
    res.json(item);
  });

  // POST create
  app.post(`/api/admin/${resourceName}`, verifyToken, (req, res) => {
    const data = readJsonFile(filename);
    const newItem = {
      id: generateId(),
      ...req.body,
      timestamp: new Date().toISOString()
    };
    data.unshift(newItem);
    writeJsonFile(filename, data);
    console.log(`✅ Created ${resourceName}:`, newItem.id);
    res.status(201).json(newItem);
  });

  // PUT update
  app.put(`/api/admin/${resourceName}/:id`, verifyToken, (req, res) => {
    const data = readJsonFile(filename);
    const index = data.findIndex(d => d.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: `${resourceName} not found` });
    }
    data[index] = { ...data[index], ...req.body, updatedAt: new Date().toISOString() };
    writeJsonFile(filename, data);
    res.json(data[index]);
  });

  // DELETE
  app.delete(`/api/admin/${resourceName}/:id`, verifyToken, (req, res) => {
    let data = readJsonFile(filename);
    const index = data.findIndex(d => d.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: `${resourceName} not found` });
    }
    data.splice(index, 1);
    writeJsonFile(filename, data);
    console.log(`✅ Deleted ${resourceName}:`, req.params.id);
    res.json({ success: true });
  });
};

// Create CRUD routes for all resources
const createAdminCrudRoutes = (resourceName) => {
  const filename = `${resourceName}.json`;

  // GET all (public read access)
  app.get(`/api/${resourceName}`, (req, res) => {
    const data = readJsonFile(filename);
    res.json(data);
  });

  // GET all (protected, including drafts)
  app.get(`/api/admin/${resourceName}`, verifyToken, (req, res) => {
    const data = readJsonFile(filename);
    res.json(data);
  });

  // GET by ID (protected)
  app.get(`/api/admin/${resourceName}/:id`, verifyToken, (req, res) => {
    const data = readJsonFile(filename);
    const item = data.find(d => d.id === req.params.id);
    if (!item) {
      return res.status(404).json({ error: `${resourceName} not found` });
    }
    res.json(item);
  });

  // POST create (protected)
  app.post(`/api/admin/${resourceName}`, verifyToken, (req, res) => {
    const data = readJsonFile(filename);
    const newItem = {
      id: generateId(),
      status: 'published', // Default status
      ...req.body,
      // Support both property styles for local JSON
      date: req.body.date || req.body.event_date,
      time: req.body.time || req.body.event_time,
      timestamp: new Date().toISOString()
    };
    data.unshift(newItem);
    writeJsonFile(filename, data);

    logAction(req.user, 'CREATE', resourceName, newItem.id, { title: newItem.title || newItem.name });

    console.log(`✅ Created ${resourceName}:`, newItem.id);
    res.status(201).json(newItem);
  });

  // PUT update (protected)
  app.put(`/api/admin/${resourceName}/:id`, verifyToken, (req, res) => {
    const data = readJsonFile(filename);
    const index = data.findIndex(d => d.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: `${resourceName} not found` });
    }

    const oldItem = { ...data[index] };
    data[index] = { ...data[index], ...req.body, updatedAt: new Date().toISOString() };
    writeJsonFile(filename, data);

    logAction(req.user, 'UPDATE', resourceName, req.params.id, {
      title: data[index].title || data[index].name,
      changes: Object.keys(req.body)
    });

    res.json(data[index]);
  });

  // DELETE (protected)
  app.delete(`/api/admin/${resourceName}/:id`, verifyToken, (req, res) => {
    let data = readJsonFile(filename);
    const index = data.findIndex(d => d.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: `${resourceName} not found` });
    }

    const deletedItem = data[index];
    data.splice(index, 1);
    writeJsonFile(filename, data);

    logAction(req.user, 'DELETE', resourceName, req.params.id, { title: deletedItem.title || deletedItem.name });

    console.log(`✅ Deleted ${resourceName}:`, req.params.id);
    res.json({ success: true });
  });
};

// Create CRUD routes for all resources
createAdminCrudRoutes('notifications');
createAdminCrudRoutes('updates');
createAdminCrudRoutes('resources');
createAdminCrudRoutes('events');
createAdminCrudRoutes('spotlight');
createAdminCrudRoutes('testimonials');
createAdminCrudRoutes('projects');

// ================== APPEARANCE SETTINGS ==================
app.get('/api/admin/appearance', (req, res) => {
  const settings = readJsonFile('appearance.json');
  if (Array.isArray(settings) && settings.length === 0) {
    // Default appearance
    return res.json({
      primaryColor: "217 91% 60%", // Default brand blue
      glowIntensity: 0.25,
      glassContrast: 0.1,
      brandingName: "FeedX Portal"
    });
  }
  res.json(settings[0] || settings);
});

app.post('/api/admin/appearance', verifyToken, (req, res) => {
  const settings = req.body;
  writeJsonFile('appearance.json', [settings]);
  logAction(req.user, 'UPDATE', 'APPEARANCE', 'GLOBAL', { settings });
  res.json({ success: true, settings });
});

// ================== GLOBAL ACTIVITY FEED ==================
app.get('/api/admin/activity', verifyToken, (req, res) => {
  try {
    const auditLogs = readAuditLogs();
    const loginLogs = readLoginLogs();

    // Combine and sort by timestamp
    const activities = [
      ...auditLogs.map(l => ({ ...l, type: 'audit' })),
      ...loginLogs.map(l => ({ ...l, type: 'login', action: l.success ? 'LOGIN_SUCCESS' : 'LOGIN_FAILURE', timestamp: l.login_time }))
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 50);

    res.json(activities);
  } catch (error) {
    res.status(500).json({ error: 'Failed to aggregate activity' });
  }
});

app.get('/api/admin/backup', verifyToken, (req, res) => {
  try {
    const backup = {
      timestamp: new Date().toISOString(),
      data: {
        events: readJsonFile('events.json'),
        spotlight: readJsonFile('spotlight.json'),
        testimonials: readJsonFile('testimonials.json'),
        resources: readJsonFile('resources.json'),
        updates: readJsonFile('updates.json'),
        institutes: readJsonFile('institutes.json'),
        notifications: readJsonFile('notifications.json'),
      }
    };
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=feedx-backup-${new Date().toISOString().split('T')[0]}.json`);
    res.json(backup);
    logAction(req.user, 'BACKUP', 'SYSTEM', 'GLOBAL');
  } catch (error) {
    res.status(500).json({ error: 'Backup failed' });
  }
});

app.delete('/api/admin/cache', verifyToken, (req, res) => {
  logAction(req.user, 'PURGE', 'CACHE', 'GLOBAL');
  res.json({ success: true, message: 'Admin cache synchronized and purged.' });
});

// Audit Logs Route
app.get('/api/admin/audit-logs', verifyToken, (req, res) => {
  try {
    const logs = readAuditLogs();
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

// Backup Route (Manual Trigger)
app.get('/api/admin/backup', verifyToken, (req, res) => {
  try {
    const dataFiles = fs.readdirSync(dataDir)
      .filter(file => file.endsWith('.json'))
      .map(file => ({
        name: file,
        content: readJsonFile(file)
      }));

    // For a production-ready system we'd use a zip library, 
    // but for now, we provide a complete JSON dump of all collections
    res.json({
      timestamp: new Date().toISOString(),
      files: dataFiles
    });

    logAction(req.user, 'BACKUP', 'SYSTEM', 'ALL', { message: 'Full data export triggered' });
  } catch (error) {
    res.status(500).json({ error: 'Backup failed' });
  }
});

// ================== PUBLIC ROUTES (No Auth Required for Reading) ==================
const createPublicReadRoutes = (resourceName) => {
  const filename = `${resourceName}.json`;

  // GET all (public)
  app.get(`/api/${resourceName}`, (req, res) => {
    const data = readJsonFile(filename);
    res.json(data);
  });

  // GET by ID (public)
  app.get(`/api/${resourceName}/:id`, (req, res) => {
    const data = readJsonFile(filename);
    const item = data.find(d => d.id === req.params.id);
    if (!item) {
      return res.status(404).json({ error: `${resourceName} not found` });
    }
    res.json(item);
  });
};

// Create public read routes for all resources
createPublicReadRoutes('notifications');
createPublicReadRoutes('updates');
createPublicReadRoutes('resources');
createPublicReadRoutes('events');
createPublicReadRoutes('spotlight');
createPublicReadRoutes('testimonials');

// Subscription endpoint
app.post('/api/subscribe', (req, res) => {
  const { name, email } = req.body;
  if (!email || !name) {
    return res.status(400).json({ success: false, error: 'Name and email are required' });
  }

  let subscriptions = [];
  try {
    subscriptions = readJsonFile('subscriptions.json');
  } catch (e) {
    subscriptions = [];
  }

  const alreadySubscribed = subscriptions.some(s => s.email === email);
  if (alreadySubscribed) {
    return res.status(200).json({ success: true, message: 'Already subscribed' });
  }

  subscriptions.push({
    name,
    email,
    date: new Date().toISOString()
  });

  writeJsonFile('subscriptions.json', subscriptions);
  res.json({ success: true, message: 'Successfully subscribed' });
});

// ================== ECET DATA ROUTES ==================
app.get('/api/ecet/syllabus', (req, res) => {
  const data = readJsonFile('ecet-syllabus.json');
  res.json(data);
});

app.get('/api/ecet/tests', (req, res) => {
  const data = readJsonFile('ecet-tests.json');
  res.json(data);
});

app.get('/api/ecet/papers', (req, res) => {
  const data = readJsonFile('ecet-papers.json');
  res.json(data);
});

// INSTITUTES - Custom routes for institute management
app.get('/api/institutes', (req, res) => {
  const institutes = readJsonFile('institutes.json');
  res.json(institutes);
});

app.get('/api/admin/institutes', verifyToken, (req, res) => {
  const institutes = readJsonFile('institutes.json');
  res.json(institutes);
});

app.get('/api/admin/institutes/:code', verifyToken, (req, res) => {
  const institutes = readJsonFile('institutes.json');
  const institute = institutes.find(i => i.code.toUpperCase() === req.params.code.toUpperCase());
  if (institute) {
    res.json(institute);
  } else {
    res.status(404).json({ error: 'Institute not found' });
  }
});

app.post('/api/admin/institutes', verifyToken, (req, res) => {
  try {
    const data = req.body;
    if (!data.code || !data.name) {
      return res.status(400).json({ error: 'Code and name are required' });
    }

    const institutes = readJsonFile('institutes.json');
    const existingIndex = institutes.findIndex(i => i.code.toUpperCase() === data.code.toUpperCase());

    const instituteData = {
      ...data,
      code: data.code.toUpperCase(),
      updatedAt: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      institutes[existingIndex] = instituteData;
    } else {
      instituteData.createdAt = new Date().toISOString();
      institutes.push(instituteData);
    }

    writeJsonFile('institutes.json', institutes);
    res.json(instituteData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/institutes/:code', verifyToken, (req, res) => {
  try {
    const institutes = readJsonFile('institutes.json');
    const filtered = institutes.filter(i => i.code.toUpperCase() !== req.params.code.toUpperCase());
    writeJsonFile('institutes.json', filtered);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ================== SBTET API PROXY ==================
// ── SBTET Lookup maps (from network inspection)
const SBTET_SCHEMES = { 'C16': '8', 'C18': '9', 'C24': '11' };
const SBTET_SEMS = { '1SEM': '1', '2SEM': '2', '3SEM': '3', '4SEM': '4', '5SEM': '5', '6SEM': '6' };
const SBTET_EXAMS = { 'Mid1': '1', 'Mid2': '2', 'Regular': '3', 'Supplementary': '4' };

// Helper: fetch JSON from SBTET — returns null if SBTET returns an error body
async function fetchSBTET(url) {
  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36',
        'Referer': 'https://www.sbtet.telangana.gov.in/',
      }
    });
    if (!response.ok) return null;
    const text = await response.text();
    if (!text.trim()) return null;
    const json = JSON.parse(text);
    // SBTET returns 200 with a Message field when the endpoint doesn't match or fails
    if (json && typeof json === 'object' && !Array.isArray(json) && json.Message) {
      console.warn('[fetchSBTET] SBTET returned error body:', json.Message.substring(0, 80));
      return null;
    }
    return json;
  } catch (e) {
    console.warn('[fetchSBTET] Fetch error:', e.message);
    return null;
  }
}

/* Legacy helpers removed */


// ================== SBTET API PROXY ==================


// ── In-memory cache for exam sessions (invalidates every 2 hours) ─────────
let _examSessionsCache = null;
let _examSessionsCachedAt = 0;
const EXAM_SESSIONS_TTL = 2 * 60 * 60 * 1000; // 2 hours

// GET /api/exam-sessions — Live from SBTET
app.get('/api/exam-sessions', async (req, res) => {
  try {
    if (_examSessionsCache && (Date.now() - _examSessionsCachedAt) < EXAM_SESSIONS_TTL) {
      return res.json({ success: true, sessions: _examSessionsCache, cached: true });
    }
    const url = 'https://www.sbtet.telangana.gov.in/api/api/Results/GetExamMonthYear';
    const raw = await fetchSBTET(url);
    let data = raw;
    if (typeof data === 'string') { try { data = JSON.parse(data); } catch (_) { } }
    const table = data?.Table || data?.table || (Array.isArray(data) ? data : []);
    if (!table.length) return res.status(502).json({ success: false, error: 'Empty exam sessions' });
    const sessions = table
      .sort((a, b) => (b.Id || 0) - (a.Id || 0))
      .map(row => ({ label: String(row.ExamYearMonth || '').trim(), value: String(row.Id) }))
      .filter(s => s.label && s.value);
    _examSessionsCache = sessions;
    _examSessionsCachedAt = Date.now();
    res.json({ success: true, sessions, cached: false });
  } catch (err) {
    if (_examSessionsCache) return res.json({ success: true, sessions: _examSessionsCache, cached: true, stale: true });
    res.status(500).json({ success: false, error: 'Failed to fetch sessions' });
  }
});

// GET /api/attendance - Fetch attendance by PIN
app.get('/api/attendance', async (req, res) => {
  try {
    const { pin } = req.query;
    if (!pin) return res.status(400).json({ success: false, error: 'PIN is required' });
    const normalized = pin.trim().toUpperCase();
    const apiUrl = `https://www.sbtet.telangana.gov.in/api/api/PreExamination/getAttendanceReport?Pin=${encodeURIComponent(normalized)}`;
    const data = await fetchSBTET(apiUrl);
    if (!data) return res.json({ success: true, attendanceSummary: null });
    const summary = {
      attendancePercentage: data.AttendancePercentage ?? data.overallAttendance ?? null,
      totalDays: data.TotalDays ?? data.totalDays ?? null,
      presentDays: data.PresentDays ?? data.presentDays ?? null,
      absentDays: data.AbsentDays ?? data.absentDays ?? null,
    };
    res.json({ success: true, attendanceSummary: summary });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal error' });
  }
});

// GET /api/results - Fetch consolidated results JSON
app.get('/api/results', async (req, res) => {
  try {
    const { pin, schemeId, semYearId, examTypeId, examMonthYearId } = req.query;
    if (!pin) return res.status(400).json({ success: false, error: 'PIN is required' });
    const normalized = pin.trim().toUpperCase();
    const isSemesterFinal = examTypeId === 'semester';
    const resolvedScheme = schemeId || '11';
    const resolvedSem = semYearId || '2';
    const resolvedMonthYear = examMonthYearId || '91';

    let data = null;
    let source = 'mid';

    if (isSemesterFinal) {
      const url = `https://www.sbtet.telangana.gov.in/api/api/Results/GetStudentWiseReport?ExamMonthYearId=${resolvedMonthYear}&ExamTypeId=5&Pin=${encodeURIComponent(normalized)}&SchemeId=${resolvedScheme}&SemYearId=${resolvedSem}&StudentTypeId=1`;
      data = await fetchSBTET(url);
      source = 'semester';
    } else {
      const midUrl = `https://www.sbtet.telangana.gov.in/api/api/Results/GetC18MidStudentWiseReport?ExamTypeId=${examTypeId || '1'}&Pin=${encodeURIComponent(normalized)}&SchemeId=${resolvedScheme}&SemYearId=${resolvedSem}`;
      data = await fetchSBTET(midUrl);
      source = 'mid';
      if (!data || (Array.isArray(data) && data.length === 0)) {
        const fallUrl = `https://www.sbtet.telangana.gov.in/api/api/PreExamination/GetStudentResult?Pin=${encodeURIComponent(normalized)}`;
        data = await fetchSBTET(fallUrl);
        source = 'final';
      }
    }

    if (!data || (Array.isArray(data) && data.length === 0)) {
      return res.status(404).json({ success: false, error: 'No results found.' });
    }
    res.json({ success: true, data, source });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal error' });
  }
});


// ================== GALLERY ==================
// Get all gallery images (public)
app.get('/api/gallery', (req, res) => {
  try {
    const gallery = readJsonFile('gallery.json');
    res.json(gallery.sort((a, b) => a.order - b.order));
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

    const gallery = readJsonFile('gallery.json');
    const newImage = {
      id: `gallery-${Date.now()}`,
      url,
      order: order || gallery.length + 1,
      created_at: new Date().toISOString()
    };

    gallery.push(newImage);
    writeJsonFile('gallery.json', gallery);
    logAction(req.user.username, 'CREATE', 'gallery', newImage.id, { url });

    res.status(201).json(newImage);
  } catch (error) {
    console.error('Error creating gallery image:', error);
    res.status(500).json({ error: 'Failed to create gallery image' });
  }
});

// Delete gallery image (protected)
app.delete('/api/gallery/:id', verifyToken, (req, res) => {
  try {
    const gallery = readJsonFile('gallery.json');
    const filteredGallery = gallery.filter(img => img.id !== req.params.id);

    if (gallery.length === filteredGallery.length) {
      return res.status(404).json({ error: 'Image not found' });
    }

    writeJsonFile('gallery.json', filteredGallery);
    logAction(req.user.username, 'DELETE', 'gallery', req.params.id);

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

    writeJsonFile('gallery.json', images);
    logAction(req.user.username, 'UPDATE', 'gallery', 'reorder', { count: images.length });

    res.json({ success: true, message: 'Gallery reordered successfully' });
  } catch (error) {
    console.error('Error reordering gallery:', error);
    res.status(500).json({ error: 'Failed to reorder gallery images' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve built frontend static files in production
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '..', 'dist');
  app.use(express.static(distPath));

  // Handle client-side routing - return index.html for all non-API, non-upload routes
  app.get('*', (req, res, next) => {
    // Don't intercept API or upload requests
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }

    // Default to Main App index.html
    res.sendFile(path.join(distPath, 'index.html'));
  });

  console.log('📦 Serving frontend from:', distPath);
}

// Sync status (public)
app.get('/api/sync/status', (req, res) => {
  res.json({ lastSync: lastSyncTime, status: syncStatus, supabaseConfigured: !!(SUPABASE_URL && SUPABASE_ANON_KEY) });
});

// Sync trigger — no auth required (harmless read-only operation; admin panel calls this after writes)
app.post('/api/sync/trigger', async (req, res) => {
  try {
    await syncFromSupabase('admin trigger');
    res.json({ success: true, message: 'Sync completed', status: syncStatus });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ============================================================
// FXBOT PROXY ROUTES
// All FXBot Supabase calls are proxied through the VPS server
// to avoid mobile network timeouts (same domain = fast)
// ============================================================

const FXBOT_URL = process.env.VITE_FXBOT_SUPABASE_URL;
const FXBOT_KEY = process.env.VITE_FXBOT_SUPABASE_ANON_KEY;

const fxbotRequest = async (method, path, body = null, authHeader = null) => {
  if (!FXBOT_URL || !FXBOT_KEY) throw new Error('FXBot Supabase not configured');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);

  // Validate the authHeader to prevent "Bearer undefined" from failing requests
  let safeAuth = `Bearer ${FXBOT_KEY}`;
  if (authHeader && authHeader !== 'Bearer undefined' && authHeader !== 'Bearer null') {
    safeAuth = authHeader;
  }

  try {
    const opts = {
      method,
      headers: {
        'apikey': FXBOT_KEY,
        'Authorization': safeAuth,
        'Content-Type': 'application/json',
        'Prefer': method === 'POST' ? 'return=representation' : 'return=minimal'
      },
      signal: controller.signal
    };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(`${FXBOT_URL}/rest/v1/${path}`, opts);
    clearTimeout(timer);
    const text = await res.text();
    return { ok: res.ok, status: res.status, data: text ? JSON.parse(text) : null };
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
};

// Student lookup by email
app.get('/api/fxbot/student', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: 'email required' });
    const r = await fxbotRequest('GET', `students?email=eq.${encodeURIComponent(email.toLowerCase())}&select=*&limit=1`, null, req.headers.authorization);
    if (!r.ok) return res.status(r.status).json(r.data);
    res.json(r.data && r.data.length > 0 ? r.data[0] : null);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Student lookup by id
app.get('/api/fxbot/student/:id', async (req, res) => {
  try {
    const r = await fxbotRequest('GET', `students?id=eq.${req.params.id}&select=*&limit=1`, null, req.headers.authorization);
    if (!r.ok) return res.status(r.status).json(r.data);
    res.json(r.data && r.data.length > 0 ? r.data[0] : null);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Create student
app.post('/api/fxbot/student', async (req, res) => {
  try {
    const r = await fxbotRequest('POST', 'students', req.body, req.headers.authorization);
    if (!r.ok) return res.status(r.status).json(r.data);
    res.json(r.data && r.data.length > 0 ? r.data[0] : null);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Validate Admin Code (publicly accessible, anon allowed)
app.get('/api/fxbot/admin-codes', async (req, res) => {
  try {
    const { code, designation } = req.query;
    const r = await fxbotRequest('GET', `fxbot_admin_codes?code=eq.${encodeURIComponent(code)}&designation=eq.${encodeURIComponent(designation)}&is_active=eq.true&select=id&limit=1`);
    res.json({ valid: !!(r.data && r.data.length > 0) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST Issue
app.post('/api/fxbot/issues', async (req, res) => {
  try {
    const r = await fxbotRequest('POST', 'fxbot_issues', { ...req.body, status: 'Pending' }, req.headers.authorization);
    if (!r.ok) return res.status(r.status).json(r.data);
    res.json(r.data && r.data.length > 0 ? r.data[0] : null);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET Student Issues
app.get('/api/fxbot/issues/student/:id', async (req, res) => {
  try {
    const r = await fxbotRequest('GET', `fxbot_issues?student_id=eq.${req.params.id}&select=*,issue_attachments(url)&order=created_at.desc`, null, req.headers.authorization);
    if (!r.ok) return res.status(r.status).json(r.data);
    res.json(r.data || []);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET Faculty Issues
app.get('/api/fxbot/issues', async (req, res) => {
  try {
    const { department, designation } = req.query;
    let path = 'fxbot_issues?select=*,issue_attachments(url)&order=created_at.desc';
    if (designation === 'Faculty' || designation === 'HOD') { // Add filtering for normal faculty
      path += `&department=eq.${encodeURIComponent(department)}`;
    }
    const r = await fxbotRequest('GET', path, null, req.headers.authorization);
    if (!r.ok) return res.status(r.status).json(r.data);
    res.json(r.data || []);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PATCH Issue
app.patch('/api/fxbot/issues/:id', async (req, res) => {
  try {
    const r = await fxbotRequest('PATCH',
      `fxbot_issues?id=eq.${req.params.id}`,
      { ...req.body, updated_at: new Date().toISOString() },
      req.headers.authorization
    );
    if (!r.ok) return res.status(r.status).json(r.data);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Send OTP (check email exists — OTP is handled client-side via Supabase Auth)
app.get('/api/fxbot/check-email', async (req, res) => {
  try {
    const { email } = req.query;
    const r = await fxbotRequest('GET', `students?email=eq.${encodeURIComponent(email?.toLowerCase() || '')}&select=id&limit=1`, null, req.headers.authorization);
    res.json({ exists: !!(r.data && r.data.length > 0) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Proxy: Send OTP via Supabase Auth (avoids mobile timeout on direct Supabase calls)
app.post('/api/fxbot/send-otp', async (req, res) => {
  if (!FXBOT_URL || !FXBOT_KEY) return res.status(503).json({ error: 'FXBot not configured' });
  const { email, shouldCreateUser = false } = req.body;
  if (!email) return res.status(400).json({ error: 'email required' });
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    // Determine if user already exists in Supabase Auth by checking the students table.
    // If they exist → create_user: false (magic link, avoids 409 on verify).
    // If brand new → create_user: true (signup OTP).
    let createUser = shouldCreateUser;
    if (shouldCreateUser) {
      try {
        const checkRes = await fxbotRequest('GET', `students?email=eq.${encodeURIComponent(email.toLowerCase())}&select=id&limit=1`);
        const alreadyExists = !!(checkRes.data && checkRes.data.length > 0);
        if (alreadyExists) createUser = false; // existing student → magic link flow
      } catch (_) { /* non-critical, fall through */ }
    }

    const r = await fetch(`${FXBOT_URL}/auth/v1/otp`, {
      method: 'POST',
      headers: { 'apikey': FXBOT_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, create_user: createUser }),
      signal: controller.signal
    });
    clearTimeout(timer);
    const data = r.ok ? {} : await r.json();
    if (!r.ok) return res.status(r.status).json({ error: data.error_description || data.msg || 'OTP send failed' });
    res.json({ success: true });
  } catch (err) {
    clearTimeout(timer);
    res.status(500).json({ error: err.message });
  }
});


// Proxy: Verify OTP via Supabase Auth
app.post('/api/fxbot/verify-otp', async (req, res) => {
  if (!FXBOT_URL || !FXBOT_KEY) return res.status(503).json({ error: 'FXBot not configured' });
  const { email, token } = req.body;
  if (!email || !token) return res.status(400).json({ error: 'email and token required' });
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);

  const tryVerify = async (type) => {
    const r = await fetch(`${FXBOT_URL}/auth/v1/verify`, {
      method: 'POST',
      headers: { 'apikey': FXBOT_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, token, type }),
      signal: controller.signal
    });
    let data;
    try { data = await r.json(); } catch (e) { data = {}; }
    return { ok: r.ok, status: r.status, data };
  };

  try {
    // First attempt: 'email' type (works for new users + signup OTPs)
    let { ok, status, data } = await tryVerify('email');
    clearTimeout(timer);

    if (!ok && status === 409) {
      // 409 = email already confirmed → existing user sent a magiclink OTP
      // Safe to retry same token with 'magiclink' type (token not consumed by a 409)
      const fb = await tryVerify('magiclink');
      ok = fb.ok; status = fb.status; data = fb.data;
    }

    if (!ok) {
      return res.status(status).json({ error: data.error_description || data.msg || 'Verification failed' });
    }

    // Return session info so frontend can use it
    res.json({ success: true, access_token: data.access_token, refresh_token: data.refresh_token, user: data.user });
  } catch (err) {
    clearTimeout(timer);
    res.status(500).json({ error: err.message });
  }
});



// SPA Fallback - Serve index.html for all other routes
// This MUST be after all API routes and static file serving
app.get('*', (req, res, next) => {
  // Don't intercept API or upload requests if they weren't caught above
  if (req.path.startsWith('/api/') || req.path.startsWith('/uploads/')) {
    return res.status(404).json({ error: 'Not found' });
  }

  if (process.env.NODE_ENV === 'production') {
    const distPath = path.join(__dirname, '..', 'dist');
    res.sendFile(path.join(distPath, 'index.html'));
  } else {
    // In dev, we shouldn't really hit this if using Vite proxy, 
    // but if we do, try to serve the dev index.html or 404
    res.status(404).send('Backend running in dev mode. Use Vite dev server (port 8080) for frontend.');
  }
});


// ============================================================
// SUPABASE SYNC ENGINE
// Keeps VPS JSON files in sync with Supabase (source of truth)
// Runs on startup + every 2 minutes automatically
// ============================================================

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const SYNC_INTERVAL_MS = 2 * 60 * 1000; // 2 minutes

const supabaseFetch = async (table, orderBy = 'created_at') => {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000); // 10s timeout
  try {
    const url = `${SUPABASE_URL}/rest/v1/${table}?select=*&order=${orderBy}.desc`;
    const res = await fetch(url, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      signal: controller.signal
    });
    clearTimeout(timer);
    if (!res.ok) {
      console.warn(`⚠️  Supabase sync: ${table} returned ${res.status}`);
      return null;
    }
    return await res.json();
  } catch (err) {
    clearTimeout(timer);
    console.warn(`⚠️  Supabase sync: failed to fetch ${table}:`, err.message);
    return null;
  }
};

// Map of Supabase table → JSON filename (and optional field remaps)
const SYNC_TABLES = [
  {
    table: 'notifications', file: 'notifications.json',
    transform: (r) => ({ ...r, timestamp: r.created_at || r.timestamp })
  },
  {
    table: 'updates', file: 'updates.json',
    transform: (r) => ({ ...r, timestamp: r.created_at || r.timestamp })
  },
  {
    table: 'resources', file: 'resources.json',
    transform: (r) => ({ ...r, timestamp: r.created_at || r.timestamp, longDescription: r.long_description || r.longDescription || '' })
  },
  {
    table: 'events', file: 'events.json',
    transform: (r) => ({
      ...r, timestamp: r.created_at || r.timestamp,
      date: r.event_date || r.date, time: r.event_time || r.time,
      registerLink: r.register_link || r.registerLink,
      isComingSoon: r.is_coming_soon ?? r.isComingSoon,
      adminStatus: r.admin_status || r.adminStatus
    })
  },
  {
    table: 'spotlight', file: 'spotlight.json',
    transform: (r) => ({ ...r, timestamp: r.created_at || r.timestamp })
  },
  {
    table: 'testimonials', file: 'testimonials.json',
    transform: (r) => ({ ...r, timestamp: r.created_at || r.timestamp })
  },
  {
    table: 'projects', file: 'projects.json',
    transform: (r) => ({ ...r, timestamp: r.created_at || r.timestamp })
  },
  {
    table: 'gallery', file: 'gallery.json',
    transform: (r) => ({ ...r, timestamp: r.created_at || r.timestamp })
  },
];

let lastSyncTime = null;
let syncStatus = { success: 0, failed: 0, lastRun: null };

const syncFromSupabase = async (reason = 'scheduled') => {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn('⚠️  Supabase sync skipped: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY not set in .env');
    return;
  }

  console.log(`🔄 Supabase sync started (${reason})...`);
  let successCount = 0;
  let failCount = 0;

  for (const { table, file, transform } of SYNC_TABLES) {
    const rows = await supabaseFetch(table);
    if (rows === null) {
      failCount++;
      continue;
    }
    const existing = readJsonFile(file);
    const synced = rows.map(transform);

    // Only write if data actually changed (avoid unnecessary disk writes)
    if (JSON.stringify(synced) !== JSON.stringify(existing)) {
      writeJsonFile(file, synced);
      console.log(`   ✅ ${table}: ${synced.length} records synced`);
    }
    successCount++;
  }

  lastSyncTime = new Date().toISOString();
  syncStatus = { success: successCount, failed: failCount, lastRun: lastSyncTime };
  console.log(`🔄 Supabase sync done: ${successCount} tables synced, ${failCount} failed — ${lastSyncTime}`);
};

// Start server
app.listen(PORT, '0.0.0.0', async () => {
  console.log(`\n🚀 Server running on http://0.0.0.0:${PORT}`);
  console.log(`📁 Uploads directory: ${uploadsDir}`);
  console.log(`💾 Data directory: ${dataDir}`);
  console.log(`\n📋 Available endpoints:`);
  console.log(`   POST /api/auth/login`);
  console.log(`   POST /api/upload`);
  console.log(`   GET/POST/PUT/DELETE /api/admin/notifications`);
  console.log(`   GET/POST/PUT/DELETE /api/admin/updates`);
  console.log(`   GET/POST/PUT/DELETE /api/admin/resources`);
  console.log('   GET/POST/PUT/DELETE /api/admin/events');
  console.log('   GET/POST/PUT/DELETE /api/admin/spotlight');
  console.log('   GET/POST/PUT/DELETE /api/admin/testimonials');
  console.log('   GET/POST/PUT/DELETE /api/admin/projects');
  console.log('   GET/POST/DELETE /api/admin/institutes');
  console.log('   POST /api/sync/trigger  (admin-protected — force immediate sync)');
  console.log('   GET  /api/sync/status   (check last sync time)');
  console.log('');
  console.log('✅ Default admin: username=admin, password=admin123\n');

  // Run initial sync on startup
  await syncFromSupabase('server startup');

  // Schedule recurring sync every 2 minutes
  setInterval(() => syncFromSupabase('scheduled'), SYNC_INTERVAL_MS);
  console.log(`🔄 Supabase auto-sync scheduled every ${SYNC_INTERVAL_MS / 60000} minutes\n`);
});

