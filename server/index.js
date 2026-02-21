import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = express();

// Security Middlewares
app.use(helmet({
  contentSecurityPolicy: false, // We handle CSP manually below for Heyzine/external embeds
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: { error: 'Too many requests from this IP, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiter to all API routes
app.use('/api/', limiter);

const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error('❌ CRITICAL ERROR: JWT_SECRET is not defined in environment variables.');
  console.error('Please check your .env file.');
  process.exit(1);
}

// Simple file-based storage
const USERS_FILE = path.join(__dirname, 'users.json');
const DATA_DIR = path.join(__dirname, '..', 'public', 'data');
const UPLOADS_DIR = path.join(__dirname, '..', 'public', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  console.log('✅ Created uploads directory:', UPLOADS_DIR);
}

// Serve uploads statically
app.use('/uploads', express.static(UPLOADS_DIR));

// Multer setup for uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9-_]/g, '');
    const stamp = Date.now();
    cb(null, `${base || 'file'}-${stamp}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
});

// Helper functions
const readUsers = () => {
  try {
    const data = fs.readFileSync(USERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

const writeUsers = (users) => {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
};

// Data file helper functions
const readDataFile = (filename) => {
  try {
    const filePath = path.join(DATA_DIR, filename);
    if (!fs.existsSync(filePath)) {
      return [];
    }
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    return [];
  }
};

const writeDataFile = (filename, data) => {
  try {
    const filePath = path.join(DATA_DIR, filename);
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Error writing ${filename}:`, error);
  }
};

// Initialize users file and create default admin if no users exist
const createDefaultAdmin = async () => {
  const users = readUsers();
  if (users.length === 0) {
    console.log('No users found. Creating default admin...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const defaultAdmin = {
      id: Date.now(),
      email: 'admin@feedx.com',
      name: 'admin',
      password: hashedPassword,
      created_at: new Date().toISOString()
    };
    writeUsers([defaultAdmin]);
    console.log('✓ Default admin created (username: admin, password: admin123)');
  }
};

if (!fs.existsSync(USERS_FILE)) {
  writeUsers([]);
}

// Create default admin on startup
createDefaultAdmin();

// Simple CORS setup for development
app.use((req, res, next) => {
  // Allow all origins in development
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, X-Access-Token');

  // Set a permissive Content Security Policy for development and Heyzine embedding
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-src 'self' https://heyzine.com https://drive.google.com https://docs.google.com;"
  );

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }

  next();
});

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Protect admin and upload routes
app.use('/api/admin', authenticateToken);
app.use('/api/upload', authenticateToken);

// Upload endpoint
app.post('/api/upload', (req, res) => {
  upload.single('file')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File too large. Max 100MB.' });
      }
      return res.status(400).json({ error: `Upload error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ error: err.message || 'Failed to upload file' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    return res.json({ url: fileUrl, filename: req.file.originalname, size: req.file.size, mimetype: req.file.mimetype });
  });
});

app.use(express.json());

// Routes
app.post('/api/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const users = readUsers();

    // Check if user exists
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = {
      id: Date.now(),
      email,
      password: hashedPassword,
      name,
      created_at: new Date().toISOString()
    };

    users.push(newUser);
    writeUsers(users);

    // Generate JWT
    const token = jwt.sign({ id: newUser.id, email: newUser.email }, JWT_SECRET);

    res.status(201).json({ token, user: { id: newUser.id, email: newUser.email, name: newUser.name } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/profile', authenticateToken, (req, res) => {
  const users = readUsers();
  const user = users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  const { password, ...userWithoutPassword } = user;
  res.json({ user: userWithoutPassword });
});

// Proxy route for SBTET Telangana attendance API
app.get('/api/attendance', async (req, res) => {
  try {
    const { pin } = req.query;

    if (!pin) {
      return res.status(400).json({ error: 'PIN parameter is required' });
    }

    // For testing purposes, return mock data if pin is 'test'
    if (pin === 'test') {
      return res.json({
        studentName: "Test Student",
        pin: pin,
        totalSubjects: 5,
        overallAttendance: 85.5,
        status: "Active",
        message: "Mock data for testing"
      });
    }

    // Fetch data from SBTET Telangana API
    const apiUrl = `https://www.sbtet.telangana.gov.in/api/api/PreExamination/getAttendanceReport?Pin=${encodeURIComponent(pin)}`;

    console.log('Fetching from:', apiUrl);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; FeedX-Proxy/1.0)'
      }
    });

    console.log('External API response status:', response.status);
    console.log('External API response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      console.error('API Response not ok:', response.status, response.statusText);
      let errorDetails = `Failed to fetch attendance data: ${response.statusText}`;

      try {
        const contentType = response.headers.get('content-type');
        console.log('Error response content-type:', contentType);

        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          console.log('Error response JSON:', errorData);
          errorDetails = errorData.message || errorData.error || errorDetails;
        } else {
          const textResponse = await response.text();
          console.log('Error response text (first 500 chars):', textResponse.substring(0, 500));
          if (textResponse) {
            errorDetails = `API Error (${response.status}): ${textResponse.substring(0, 200)}`;
          }
        }
      } catch (parseError) {
        console.error('Could not parse error response:', parseError);
      }

      return res.status(response.status).json({
        error: errorDetails
      });
    }

    // Check if response has content
    const contentLength = response.headers.get('content-length');
    console.log('Response content-length:', contentLength);

    if (contentLength === '0') {
      console.log('Response has no content');
      return res.status(404).json({
        error: 'No attendance data found for this PIN'
      });
    }

    let data;
    try {
      const responseText = await response.text();
      console.log('Raw response (first 500 chars):', responseText.substring(0, 500));

      if (!responseText.trim()) {
        return res.status(404).json({
          error: 'Empty response from attendance API'
        });
      }

      data = JSON.parse(responseText);
      console.log('Parsed JSON successfully');
    } catch (jsonError) {
      console.error('JSON parsing error:', jsonError);
      return res.status(500).json({
        error: 'Invalid JSON response from attendance API',
        details: jsonError.message
      });
    }

    console.log('API Response received successfully');
    res.json(data);

  } catch (error) {
    console.error('Error fetching attendance data:', error);
    res.status(500).json({ error: 'Internal server error while fetching attendance data' });
  }
});

// Proxy route for SBTET Telangana results API
app.get('/api/results', async (req, res) => {
  try {
    const { pin } = req.query;

    if (!pin) {
      return res.status(400).json({ error: 'PIN parameter is required' });
    }

    // For testing purposes, return mock data if pin is 'test'
    if (pin === 'test') {
      return res.json({
        success: true,
        data: {
          Table: [
            {
              StudentName: "Test Student",
              Pin: pin,
              BranchCode: "CPS",
              Scheme: "C-18",
              CenterName: "Test Center",
              CenterCode: "001"
            }
          ],
          Table1: [
            {
              TotalMaxCredits: 100,
              CreditsGained: 85,
              CGPA: 8.5
            }
          ],
          Table2: [],
          Table3: []
        }
      });
    }

    // Fetch data from SBTET Telangana API
    const apiUrl = `https://www.sbtet.telangana.gov.in/api/api/PreExamination/GetStudentResult?Pin=${encodeURIComponent(pin)}`;

    console.log('Fetching results from:', apiUrl);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; FeedX-Proxy/1.0)'
      }
    });

    console.log('Results API response status:', response.status);

    if (!response.ok) {
      console.error('Results API Response not ok:', response.status, response.statusText);
      let errorDetails = `Failed to fetch results: ${response.statusText}`;

      try {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          errorDetails = errorData.message || errorData.error || errorDetails;
        }
      } catch (parseError) {
        console.error('Could not parse error response:', parseError);
      }

      return res.status(response.status).json({
        success: false,
        error: errorDetails
      });
    }

    let data;
    try {
      const responseText = await response.text();
      console.log('Raw results response (first 500 chars):', responseText.substring(0, 500));

      if (!responseText.trim()) {
        return res.status(404).json({
          success: false,
          error: 'Empty response from results API'
        });
      }

      data = JSON.parse(responseText);
      console.log('Results parsed successfully');
    } catch (jsonError) {
      console.error('JSON parsing error:', jsonError);
      return res.status(500).json({
        success: false,
        error: 'Invalid JSON response from results API',
        details: jsonError.message
      });
    }

    // Return with success flag
    res.json({
      success: true,
      data: data
    });

  } catch (error) {
    console.error('Error fetching results data:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while fetching results data'
    });
  }
});

// ================== AUTHENTICATION ROUTES ==================

const LOGIN_LOGS_FILE = path.join(__dirname, 'login_logs.json');
const ADMIN_LOGS_FILE = path.join(__dirname, 'admin_logs.json');

const readLoginLogs = () => {
  try {
    if (!fs.existsSync(LOGIN_LOGS_FILE)) return [];
    return JSON.parse(fs.readFileSync(LOGIN_LOGS_FILE, 'utf8'));
  } catch {
    return [];
  }
};

const writeLoginLogs = (logs) => {
  fs.writeFileSync(LOGIN_LOGS_FILE, JSON.stringify(logs, null, 2));
};

// Verify JWT token
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

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  console.log('Login endpoint called:', req.body);
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const users = readUsers();
    const user = users.find(u => u.email === username || u.name === username);

    if (!user) {
      const logs = readLoginLogs();
      logs.push({
        id: Date.now(),
        username,
        login_time: new Date().toISOString(),
        ip_address: req.ip,
        success: false
      });
      writeLoginLogs(logs);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      const logs = readLoginLogs();
      logs.push({
        id: Date.now(),
        username,
        login_time: new Date().toISOString(),
        ip_address: req.ip,
        success: false
      });
      writeLoginLogs(logs);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Log successful login
    const logs = readLoginLogs();
    logs.push({
      id: Date.now(),
      username,
      login_time: new Date().toISOString(),
      ip_address: req.ip,
      success: true
    });
    writeLoginLogs(logs);

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name || user.email,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Register endpoint (protected)
app.post('/api/auth/register', verifyToken, async (req, res) => {
  try {
    const { username, password, name, email, phone, pin } = req.body;

    if (!username || !password || !name || !email || !phone || !pin) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const users = readUsers();

    const existingUser = users.find(u => u.email === email || u.name === username);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      id: Date.now(),
      username,
      password: hashedPassword,
      name,
      email,
      phone,
      pin,
      created_at: new Date().toISOString()
    };

    users.push(newUser);
    writeUsers(users);

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: newUser.id,
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

// Get all users (protected)
app.get('/api/auth/users', verifyToken, (req, res) => {
  try {
    const users = readUsers();
    const safeUsers = users.map(u => ({
      id: u.id,
      username: u.username || u.name,
      name: u.name,
      email: u.email,
      phone: u.phone,
      created_at: u.created_at || new Date().toISOString()
    }));
    res.json(safeUsers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get login logs (protected)
app.get('/api/auth/login-logs', verifyToken, (req, res) => {
  try {
    const { username } = req.query;
    let logs = readLoginLogs();

    if (username) {
      logs = logs.filter(log => log.username === username);
    }

    res.json(logs.slice(-100)); // Return last 100 logs
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

// Delete user (protected)
app.delete('/api/auth/users/:id', verifyToken, (req, res) => {
  try {
    const { id } = req.params;
    const users = readUsers();
    const filtered = users.filter(u => u.id !== parseInt(id));
    writeUsers(filtered);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// ================== WEB CRAWLER ROUTES ==================

// Simple web crawler for GIOE
app.get('/api/crawler/gioe', verifyToken, async (req, res) => {
  try {
    // Return cached or fetch fresh data
    const cachedData = {
      url: 'https://gioe.netlify.app/',
      title: 'GIOE - Global Institute of Excellence',
      fetched_at: new Date().toISOString(),
      sections: {
        announcements: [
          {
            title: 'Welcome to GIOE',
            description: 'Global Institute of Excellence - Transforming Education',
            date: new Date().toISOString()
          }
        ],
        opportunities: [
          {
            title: 'Internship Opportunities',
            company: 'GIOE',
            description: 'Join our team and grow your skills',
          }
        ],
        events: [
          {
            title: 'Monthly Webinar',
            date: new Date().toISOString(),
            location: 'Online'
          }
        ]
      }
    };

    // In production, implement actual web crawling with cheerio/jsdom
    res.json(cachedData);
  } catch (error) {
    console.error('Crawler error:', error);
    res.status(500).json({ error: 'Failed to crawl website' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Test endpoint: http://0.0.0.0:${PORT}/api/test`);
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is running', timestamp: new Date().toISOString() });
});

// ================== ECET DATA ROUTES ==================
app.get('/api/ecet/syllabus', (req, res) => {
  const data = readDataFile('ecet-syllabus.json');
  res.json(data);
});

app.get('/api/ecet/tests', (req, res) => {
  const data = readDataFile('ecet-tests.json');
  res.json(data);
});

app.get('/api/ecet/papers', (req, res) => {
  const data = readDataFile('ecet-papers.json');
  res.json(data);
});

// ============ ADMIN PANEL APIs ============

// NOTIFICATIONS
app.get('/api/admin/notifications', (req, res) => {
  const notifications = readDataFile('notifications.json');
  res.json(notifications);
});

app.post('/api/admin/notifications', (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    const notifications = readDataFile('notifications.json');
    const newNotification = {
      id: `notif-${Date.now()}`,
      title,
      description,
      timestamp: new Date().toISOString()
    };

    notifications.push(newNotification);
    writeDataFile('notifications.json', notifications);
    res.status(201).json(newNotification);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create notification' });
  }
});

app.delete('/api/admin/notifications/:id', (req, res) => {
  try {
    const notifications = readDataFile('notifications.json');
    const filtered = notifications.filter(n => n.id !== req.params.id);
    writeDataFile('notifications.json', filtered);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

// UPDATES
app.get('/api/admin/updates', (req, res) => {
  const updates = readDataFile('updates.json');
  res.json(updates);
});

app.post('/api/admin/updates', (req, res) => {
  try {
    const { title, description, images, priority } = req.body;
    if (!title || !description || !priority) {
      return res.status(400).json({ error: 'Title, description, and priority are required' });
    }

    const updates = readDataFile('updates.json');
    const newUpdate = {
      id: `update-${Date.now()}`,
      title,
      description,
      images: images || [],
      priority,
      timestamp: new Date().toISOString()
    };

    updates.push(newUpdate);
    writeDataFile('updates.json', updates);
    res.status(201).json(newUpdate);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create update' });
  }
});

app.delete('/api/admin/updates/:id', (req, res) => {
  try {
    const updates = readDataFile('updates.json');
    const filtered = updates.filter(u => u.id !== req.params.id);
    writeDataFile('updates.json', filtered);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete update' });
  }
});

// RESOURCES
app.get('/api/admin/resources', (req, res) => {
  const resources = readDataFile('resources.json');
  res.json(resources);
});

app.get('/api/admin/resources/:id', (req, res) => {
  const resources = readDataFile('resources.json');
  const resource = resources.find(r => r.id === req.params.id);
  if (!resource) {
    return res.status(404).json({ error: 'Resource not found' });
  }
  res.json(resource);
});

app.post('/api/admin/resources', (req, res) => {
  try {
    const { title, description, longDescription, tags, files, images } = req.body;
    if (!title || !description || !longDescription) {
      return res.status(400).json({ error: 'Title, description, and longDescription are required' });
    }

    const resources = readDataFile('resources.json');
    const newResource = {
      id: `resource-${Date.now()}`,
      title,
      description,
      longDescription,
      tags: tags || [],
      files: files || [],
      images: images || [],
      timestamp: new Date().toISOString()
    };

    resources.push(newResource);
    writeDataFile('resources.json', resources);
    res.status(201).json(newResource);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create resource' });
  }
});

app.delete('/api/admin/resources/:id', (req, res) => {
  try {
    const resources = readDataFile('resources.json');
    const filtered = resources.filter(r => r.id !== req.params.id);
    writeDataFile('resources.json', filtered);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete resource' });
  }
});

// EVENTS
app.get('/api/admin/events', (req, res) => {
  const events = readDataFile('events.json');
  res.json(events);
});

app.post('/api/admin/events', (req, res) => {
  try {
    const { title, description, image, date, time, location, registerLink } = req.body;
    if (!title || !description || !date || !time || !location) {
      return res.status(400).json({ error: 'Title, description, date, time, and location are required' });
    }

    const events = readDataFile('events.json');
    const newEvent = {
      id: `event-${Date.now()}`,
      title,
      description,
      image: image || '',
      date,
      time,
      location,
      registerLink: registerLink || '#',
      timestamp: new Date().toISOString()
    };

    events.push(newEvent);
    writeDataFile('events.json', events);
    res.status(201).json(newEvent);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create event' });
  }
});

app.delete('/api/admin/events/:id', (req, res) => {
  try {
    const events = readDataFile('events.json');
    const filtered = events.filter(e => e.id !== req.params.id);
    writeDataFile('events.json', filtered);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

// SPOTLIGHT
app.get('/api/admin/spotlight', (req, res) => {
  const spotlight = readDataFile('spotlight.json');
  res.json(spotlight);
});

app.post('/api/admin/spotlight', (req, res) => {
  try {
    const { title, description, images } = req.body;
    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    const spotlight = readDataFile('spotlight.json');
    const newSpotlight = {
      id: `spotlight-${Date.now()}`,
      title,
      description,
      images: images || [],
      timestamp: new Date().toISOString()
    };

    spotlight.push(newSpotlight);
    writeDataFile('spotlight.json', spotlight);
    res.status(201).json(newSpotlight);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create spotlight' });
  }
});

app.delete('/api/admin/spotlight/:id', (req, res) => {
  try {
    const spotlight = readDataFile('spotlight.json');
    const filtered = spotlight.filter(s => s.id !== req.params.id);
    writeDataFile('spotlight.json', filtered);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete spotlight' });
  }
});

// TESTIMONIALS
app.get('/api/admin/testimonials', (req, res) => {
  const testimonials = readDataFile('testimonials.json');
  res.json(testimonials);
});

app.post('/api/admin/testimonials', (req, res) => {
  try {
    const { name, title, content, image } = req.body;
    if (!name || !title || !content) {
      return res.status(400).json({ error: 'Name, title, and content are required' });
    }

    const testimonials = readDataFile('testimonials.json');
    const newTestimonial = {
      id: `testimonial-${Date.now()}`,
      name,
      title,
      content,
      image: image || '',
      timestamp: new Date().toISOString()
    };

    testimonials.push(newTestimonial);
    writeDataFile('testimonials.json', testimonials);
    res.status(201).json(newTestimonial);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create testimonial' });
  }
});

app.delete('/api/admin/testimonials/:id', (req, res) => {
  try {
    const testimonials = readDataFile('testimonials.json');
    const filtered = testimonials.filter(t => t.id !== req.params.id);
    writeDataFile('testimonials.json', filtered);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete testimonial' });
  }
});

// INSTITUTES
app.get('/api/admin/institutes', (req, res) => {
  const institutes = readDataFile('institutes.json');
  res.json(institutes);
});

app.get('/api/admin/institutes/:code', (req, res) => {
  const institutes = readDataFile('institutes.json');
  const institute = institutes.find(i => i.code.toUpperCase() === req.params.code.toUpperCase());
  if (!institute) {
    return res.status(404).json({ error: 'Institute not found' });
  }
  res.json(institute);
});

app.post('/api/admin/institutes', (req, res) => {
  try {
    const data = req.body;
    if (!data.code) {
      return res.status(400).json({ error: 'College code is required' });
    }

    const institutes = readDataFile('institutes.json');
    const existingIndex = institutes.findIndex(i => i.code.toUpperCase() === data.code.toUpperCase());

    const instituteData = {
      ...data,
      code: data.code.toUpperCase(),
      timestamp: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      // Update existing
      institutes[existingIndex] = instituteData;
    } else {
      // Add new
      institutes.push(instituteData);
    }

    writeDataFile('institutes.json', institutes);
    res.status(201).json(instituteData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save institute' });
  }
});

app.delete('/api/admin/institutes/:code', (req, res) => {
  try {
    const institutes = readDataFile('institutes.json');
    const filtered = institutes.filter(i => i.code.toUpperCase() !== req.params.code.toUpperCase());
    writeDataFile('institutes.json', filtered);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete institute' });
  }
});