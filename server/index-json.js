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
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-src 'self' https://heyzine.com https://drive.google.com https://docs.google.com;"
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
// In-memory cache for results
const resultsCache = new Map();
const resultsJsonCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const sbtetHeaders = {
  'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/javascript, */*; q=0.01',
  'Accept-Language': 'en-US,en;q=0.9',
  'X-Requested-With': 'XMLHttpRequest',
  'Referer': 'https://www.sbtet.telangana.gov.in/',
};

// Helper to convert value to number
const toNumber = (value) => {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') return value;
  const s = String(value).trim();
  if (!s) return null;
  const cleaned = s.replace(/[^0-9.]/g, '');
  if (!cleaned) return null;
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
};

// Helper to find number by key pattern
const pickNumberByKey = (obj, patterns) => {
  if (!obj || typeof obj !== 'object') return null;
  for (const [key, value] of Object.entries(obj)) {
    const k = String(key).toLowerCase();
    if (patterns.some(p => k.match(p))) {
      const n = toNumber(value);
      if (n !== null) return n;
    }
  }
  return null;
};

// Compute attendance summary
const computeAttendanceSummary = (studentInfo, records) => {
  const source = (studentInfo && Object.keys(studentInfo).length > 0)
    ? studentInfo
    : (records && records.length > 0 ? records[0] : {});

  // Debug log to see actual keys
  console.log('Attendance source keys:', Object.keys(source));
  console.log('Attendance source values:', source);

  let totalDays = pickNumberByKey(source, [/total.*day/i, /working.*day/i, /no.*day/i, /totday/i, /twd/i, /twdays/i, /totalworkingdays/i, /noofdays/i]);
  let presentDays = pickNumberByKey(source, [/present.*day/i, /attend.*day/i, /presentday/i, /pday/i, /noofpresentdays/i, /presentdays/i, /daysattended/i, /attended/i]);
  let percent = pickNumberByKey(source, [/percent/i, /percentage/i, /attend.*%/i, /att.*per/i, /attendancepercent/i]);

  // Also check for direct field access with common variations
  if (totalDays === null) {
    totalDays = toNumber(source.TotalWorkingDays) ?? toNumber(source.TotalDays) ?? toNumber(source.TWDays) ?? toNumber(source.NoOfDays);
  }
  if (presentDays === null) {
    presentDays = toNumber(source.PresentDays) ?? toNumber(source.NoOfPresentDays) ?? toNumber(source.DaysAttended) ?? toNumber(source.Attended);
  }
  if (percent === null) {
    percent = toNumber(source.AttendancePercentage) ?? toNumber(source.Percentage) ?? toNumber(source.AttPercent);
  }

  if (percent === null && totalDays !== null && totalDays > 0 && presentDays !== null) {
    percent = (presentDays / totalDays) * 100;
  }

  const asInt = (n) => {
    if (n === null) return null;
    return Math.abs(n - Math.round(n)) < 1e-9 ? Math.round(n) : n;
  };

  const totalDaysN = asInt(totalDays);
  const presentDaysN = asInt(presentDays);
  const absentDaysN = (totalDaysN !== null && presentDaysN !== null)
    ? asInt(totalDaysN - presentDaysN)
    : null;

  return {
    attendancePercentage: percent !== null ? Math.round(percent * 100) / 100 : null,
    totalDays: totalDaysN,
    presentDays: presentDaysN,
    absentDays: absentDaysN,
  };
};

// Fetch attendance by proxying the internal HTML endpoint and parsing minimal fields
const fetchAttendance = async (pin) => {
  // First try proxy HTML parsing
  try {
    const html = await fetchResultsHtml(pin);

    // Try to extract attendance percentage
    const percentMatch = html.match(/([0-9]{1,3}(?:\.[0-9]+)?)\s?%/);
    const attendancePercentage = percentMatch ? parseFloat(percentMatch[1]) : null;

    // Try to extract SGPA/CGPA
    const sgpaMatch = html.match(/(SGPA|CGPA|GPA)[:\s]*([0-9]+(?:\.[0-9]+)?)/i);
    const sgpa = sgpaMatch ? parseFloat(sgpaMatch[2]) : null;

    // Try to extract student name
    const nameMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/i) || html.match(/Student\s*Name[:\s]*([^<\n\r]+)/i);
    const studentName = nameMatch ? nameMatch[1].trim() : null;

    // Extract simple subject rows from any tables
    const rows = [];
    const trRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    let tr;
    while ((tr = trRegex.exec(html)) !== null) {
      const cols = [...tr[1].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)].map(m => m[1].replace(/<[^>]+>/g, '').trim());
      if (cols.length >= 2) {
        rows.push({ subject: cols[0], details: cols.slice(1) });
      }
    }

    // If parsing yields useful data, return it
    if (studentName || rows.length || attendancePercentage !== null) {
      return {
        Table: [{ StudentName: studentName || null, Pin: pin }],
        Table1: rows,
        rawHtml: html,
        attendanceMeta: {
          attendancePercentage,
          sgpa
        }
      };
    }
  } catch (err) {
    // fallthrough to try direct SBTET JSON endpoints
    console.warn('Proxy HTML fetch failed, falling back to SBTET JSON endpoints:', err.message);
  }

  const normalizedPin = pin.toUpperCase();
  const urls = [
    `https://www.sbtet.telangana.gov.in/api/api/PreExamination/getAttendanceReport?Pin=${normalizedPin}`,
    `https://www.sbtet.telangana.gov.in/api/PreExamination/getAttendanceReport?Pin=${normalizedPin}`,
  ];

  let lastError = null;
  for (const url of urls) {
    try {
      console.log(`[DEBUG] Fetching Attendance from: ${url}`);
      const response = await fetch(url, { headers: sbtetHeaders, timeout: 15000 });
      console.log(`[DEBUG] Attendance API Status: ${response.status}`);

      if (!response.ok) {
        lastError = new Error(`HTTP ${response.status}`);
        continue;
      }
      let data = await response.json();
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data);
        } catch (e) {
          console.error('[DEBUG] Failed to parse double-encoded JSON for attendance', e);
        }
      }

      console.log(`[DEBUG] Attendance Data Received:`, data ? 'Valid' : 'Null');
      return data;
    } catch (err) {
      console.error(`[DEBUG] Error fetching attendance from ${url}:`, err.message);
      lastError = err;
    }
  }
  throw lastError || new Error('Failed to fetch attendance from SBTET');
};

// Fetch results JSON from SBTET
const fetchResultsJson = async (pin) => {
  const pinKey = pin.toLowerCase();
  const cached = resultsJsonCache.get(pinKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  try {
    const html = await fetchResultsHtml(pin);

    // PARSING LOGIC: Extract data from Proxy HTML and map to SBTET Schema
    // 1. Extract SGPA Data from script tag
    // Format: const sgpaData = [{"credits": 20.0, "sem_id": 1, "semester": "1SEM", "sgpa": 7.88, "total_grade_points": 157.5}, ...];
    const sgpaScriptMatch = html.match(/const sgpaData\s*=\s*(\[.*?\]);/s);
    let table3 = []; // SGPA History
    if (sgpaScriptMatch && sgpaScriptMatch[1]) {
      try {
        const sgpaRaw = JSON.parse(sgpaScriptMatch[1]);
        table3 = sgpaRaw.map(s => ({
          Semester: s.semester,
          Credits: s.credits,
          TotalGradePoints: s.total_grade_points,
          SGPA: s.sgpa,
          SemId: s.sem_id
        }));
        console.log(`[DEBUG] Parsed ${table3.length} SGPA records`);
      } catch (e) {
        console.error('[DEBUG] Failed to parse SGPA script JSON', e);
      }
    }

    // 2. Extract Student Details (Name, Pin, Branch, Center)
    console.log(`[DEBUG] Proxy HTML Sample: ${html.substring(0, 500).replace(/\n/g, ' ')}`);

    // Improved regex to capture text following the strong tag labels, handling variability in colon placement and newlines.
    const extractStrong = (label) => {
      // Use [\s\S]*? to match across newlines and handle boundaries more flexibly
      const regex = new RegExp(`<strong>\\s*${label}\\s*[:\\s]*<\\/strong>\\s*[:\\s]*([\\s\\S]*?)(?:<br>|</div>|<\\/div>|$)`, 'i');
      const match = html.match(regex);
      return match ? match[1].trim() : '';
    };

    const studentName = extractStrong('Name');
    const studentPin = extractStrong('PIN') || pin;
    const branch = extractStrong('Branch');
    const center = extractStrong('Center');

    console.log(`[DEBUG] Extracted Student Result: Name="${studentName}", PIN="${studentPin}", Branch="${branch}", Center="${center}"`);
    if (!branch) {
      console.warn(`[DEBUG] BRANCH EXTRACTION FAILED for PIN ${pin}. Searching for "Branch" in HTML... Found index: ${html.indexOf('Branch')}`);
    }

    // 3. Extract All Subjects from the "All Subjects" table
    // Table Headers: Semester, Subject, Code, Type, Marks, Grade, Grade Point, Credits
    let table2 = []; // Subjects
    const tableRegex = /<table[^>]*class="data-table"[^>]*>([\s\S]*?)<\/table>/gi;
    let match;
    while ((match = tableRegex.exec(html)) !== null) {
      const tableContent = match[1];
      // Check if this is the "All Subjects" table by looking for header
      if (tableContent.includes('<th>Subject</th>') && tableContent.includes('<th>Code</th>')) {
        const trRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
        let trMatch;
        // Skip header row usually, but our regex captures all trs.
        // We filter by checking if it has <td>
        while ((trMatch = trRegex.exec(tableContent)) !== null) {
          const rowHtml = trMatch[1];
          const cols = [...rowHtml.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map(m => m[1].replace(/<[^>]+>/g, '').trim());

          // Expecting 8 columns
          if (cols.length >= 8) {
            table2.push({
              Semester: cols[0],
              SubjectName: cols[1],
              Subject_Code: cols[2],
              // Type: cols[3], // Not in standard schema but useful
              SubjectTotal: cols[4] !== '—' ? cols[4] : null, // Marks
              HybridGrade: cols[5], // Grade
              GradePoint: cols[6],
              MaxCredits: cols[7]
            });
          }
        }
      }
    }
    console.log(`[DEBUG] Parsed ${table2.length} Subject records`);

    // 4. Calculate Summary (Table1)
    // CGPA, TotalMaxCredits, CreditsGained
    // Extract directly from HTML if available
    const cgpaRaw = extractStrong('CGPA');
    const creditsRaw = extractStrong('Credits'); // e.g., "40.0/40.0"

    let calculatedCgpa = cgpaRaw && !isNaN(parseFloat(cgpaRaw)) ? parseFloat(cgpaRaw) : null;
    let totalCredits = 0;
    let gainedCredits = 0;

    if (creditsRaw && creditsRaw.includes('/')) {
      const [gained, total] = creditsRaw.split('/').map(s => parseFloat(s));
      if (!isNaN(gained)) gainedCredits = gained;
      if (!isNaN(total)) totalCredits = total;
    } else {
      // Fallback calculation
      if (table3.length > 0) {
        table3.forEach(rec => {
          if (rec.Credits) {
            const cred = parseFloat(rec.Credits);
            totalCredits += cred;
            gainedCredits += cred; // Approx 
          }
        });
      } else {
        table2.forEach(sub => {
          const cred = parseFloat(sub.MaxCredits || 0);
          totalCredits += cred;
          if (sub.HybridGrade !== 'F' && sub.HybridGrade !== 'AB') {
            gainedCredits += cred;
          }
        });
      }

      if (calculatedCgpa === null && table3.length > 0) {
        let sum = 0;
        let count = 0;
        table3.forEach(rec => {
          if (rec.SGPA) {
            sum += parseFloat(rec.SGPA);
            count++;
          }
        });
        if (count > 0) calculatedCgpa = (sum / count).toFixed(2);
      }
    }

    // 5. Construct Final Payload
    const data = {
      Table: [{
        StudentName: studentName,
        Pin: studentPin,
        Branch: branch,
        BranchName: branch,
        BranchCode: branch,
        CenterName: center
      }],
      Table1: [{
        TotalMaxCredits: totalCredits,
        CreditsGained: gainedCredits,
        CGPA: calculatedCgpa
      }],
      Table2: table2,
      Table3: table3
    };

    if (studentName || table2.length > 0 || table3.length > 0) {
      resultsJsonCache.set(pinKey, { timestamp: Date.now(), data });
      return data;
    }
  } catch (err) {
    console.warn('[DEBUG] Proxy HTML parsing failed:', err.message);
    throw err; // Propagate error since we removed fallback
  }

  // Fallback removed as requested
  throw new Error('Failed to fetch results from Proxy');
};

// Fetch results HTML from proxy
const fetchResultsHtml = async (pin) => {
  const pinKey = pin.toLowerCase();
  const cached = resultsCache.get(pinKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log('[DEBUG] Returning Cached HTML');
    return cached.html;
  }

  const normalizedPin = pin.toUpperCase();
  const url = `http://18.61.7.125/result/${normalizedPin}`;
  console.log(`[DEBUG] Fetching Proxy HTML from: ${url}`);

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': sbtetHeaders['User-Agent'],
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      timeout: 20000,
    });

    console.log(`[DEBUG] Proxy HTML Status: ${response.status}`);

    if (response.status === 404) {
      throw new Error('Student not found');
    }
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    console.log(`[DEBUG] Proxy HTML Length: ${html.length}`);

    if (html.length < 200) {
      throw new Error('Empty HTML response');
    }

    resultsCache.set(pinKey, { timestamp: Date.now(), html });
    return html;
  } catch (e) {
    console.error(`[DEBUG] Proxy Fetch Failed: ${e.message}`);
    throw e;
  }
};

// GET /api/attendance - Fetch attendance by PIN
app.get('/api/attendance', async (req, res) => {
  const { pin } = req.query;
  if (!pin) {
    return res.status(400).json({ error: 'Missing pin parameter' });
  }

  try {
    const data = await fetchAttendance(pin);

    if (!data) {
      return res.status(404).json({ success: false, error: 'No data returned from SBTET API' });
    }

    const response = {
      success: true,
      studentInfo: {},
      attendanceRecords: [],
      attendanceSummary: {
        attendancePercentage: null,
        totalDays: null,
        presentDays: null,
        absentDays: null,
      },
    };

    if (typeof data === 'object') {
      if (!data || Object.values(data).every(v => !v)) {
        return res.status(404).json({
          success: false,
          error: 'No data found for this PIN. Please verify the PIN is correct.',
        });
      }

      if (data.Table && Array.isArray(data.Table) && data.Table.length > 0) {
        response.studentInfo = data.Table[0];
      }

      if (data.Table1 && Array.isArray(data.Table1)) {
        response.attendanceRecords = data.Table1;
      } else if (data.Table && Array.isArray(data.Table) && !response.studentInfo) {
        response.attendanceRecords = data.Table;
      }
    }

    response.attendanceSummary = computeAttendanceSummary(
      response.studentInfo,
      response.attendanceRecords
    );

    // If attendance is not found, default to 0% as requested
    if (!response.attendanceSummary.attendancePercentage && response.attendanceSummary.attendancePercentage !== 0) {
      response.attendanceSummary = {
        attendancePercentage: 0,
        totalDays: 0,
        presentDays: 0,
        absentDays: 0,
        isFallback: true
      };
    }

    if (!response.studentInfo || Object.keys(response.studentInfo).length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No data found for this PIN. The PIN may be invalid or not in the SBTET system.',
      });
    }

    res.json(response);
  } catch (err) {
    console.error('Attendance API error:', err.message);
    if (err.message.includes('404') || err.message.includes('not found')) {
      return res.status(404).json({ error: 'Student not found. Please check the PIN.' });
    }
    if (err.message.includes('timeout')) {
      return res.status(504).json({ error: 'Request timeout. Please try again.' });
    }
    res.status(502).json({ error: `Network error: ${err.message}` });
  }
});

// GET /api/results - Fetch consolidated results JSON
app.get('/api/results', async (req, res) => {
  const { pin } = req.query;
  if (!pin) {
    return res.status(400).json({ success: false, error: 'Missing pin parameter' });
  }

  try {
    const data = await fetchResultsJson(pin);
    res.json({ success: true, pin, data });
  } catch (err) {
    console.error('Results API error:', err.message);
    if (err.message.includes('404') || err.message.includes('not found')) {
      return res.status(404).json({ success: false, error: 'Student not found. Please check the PIN.' });
    }
    if (err.message.includes('timeout')) {
      return res.status(504).json({ success: false, error: 'Request timeout. Please try again.' });
    }
    res.status(500).json({ success: false, error: `Server error: ${err.message}` });
  }
});

// GET /api/results/raw - Fetch results HTML
app.get('/api/results/raw', async (req, res) => {
  const { pin } = req.query;
  if (!pin) {
    return res.status(400).json({ success: false, error: 'Missing pin parameter' });
  }

  try {
    const html = await fetchResultsHtml(pin);
    res.json({ success: true, pin, html });
  } catch (err) {
    console.error('Results raw API error:', err.message);
    if (err.message.includes('not found')) {
      return res.status(404).json({ success: false, error: 'Student not found. Please check the PIN.' });
    }
    if (err.message.includes('timeout')) {
      return res.status(504).json({ success: false, error: 'Request timeout. Please try again.' });
    }
    res.status(500).json({ success: false, error: `Server error: ${err.message}` });
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

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Server running on http://0.0.0.0:${PORT}`);
  console.log(`📁 Uploads directory: ${uploadsDir}`);
  console.log(`💾 Data directory: ${dataDir}`);
  console.log(`\n📋 Available endpoints:`);
  console.log(`   POST /api/auth/login`);
  console.log(`   POST /api/upload`);
  console.log(`   GET/POST/PUT/DELETE /api/admin/notifications`);
  console.log(`   GET/POST/PUT/DELETE /api/admin/updates`);
  console.log(`   GET/POST/PUT/DELETE /api/admin/resources`);
  console.log(`   GET/POST/PUT/DELETE /api/admin/events`);
  console.log(`   GET/POST/PUT/DELETE /api/admin/spotlight`);
  console.log(`   GET/POST/PUT/DELETE /api/admin/testimonials`);
  console.log(`   GET/POST/DELETE /api/admin/institutes`);
  console.log(`\n✅ Default admin: username=admin, password=admin123\n`);
});
