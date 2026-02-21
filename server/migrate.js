import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db, { initializeDatabase } from './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '..', 'public', 'data');

console.log('🔄 Starting migration from JSON to SQLite...');

// Initialize database
initializeDatabase();

// Migration function
const migrateData = () => {
  try {
    // Migrate notifications
    const notificationsFile = path.join(DATA_DIR, 'notifications.json');
    if (fs.existsSync(notificationsFile)) {
      const notifications = JSON.parse(fs.readFileSync(notificationsFile, 'utf8'));
      const stmt = db.prepare('INSERT OR IGNORE INTO notifications (id, title, description, timestamp) VALUES (?, ?, ?, ?)');
      notifications.forEach(n => {
        stmt.run(n.id, n.title, n.description, n.timestamp);
      });
      console.log(`✅ Migrated ${notifications.length} notifications`);
    }

    // Migrate updates
    const updatesFile = path.join(DATA_DIR, 'updates.json');
    if (fs.existsSync(updatesFile)) {
      const updates = JSON.parse(fs.readFileSync(updatesFile, 'utf8'));
      const stmt = db.prepare('INSERT OR IGNORE INTO updates (id, title, description, images, priority, timestamp) VALUES (?, ?, ?, ?, ?, ?)');
      updates.forEach(u => {
        stmt.run(u.id, u.title, u.description, JSON.stringify(u.images || []), u.priority || 'medium', u.timestamp);
      });
      console.log(`✅ Migrated ${updates.length} updates`);
    }

    // Migrate resources
    const resourcesFile = path.join(DATA_DIR, 'resources.json');
    if (fs.existsSync(resourcesFile)) {
      const resources = JSON.parse(fs.readFileSync(resourcesFile, 'utf8'));
      const stmt = db.prepare('INSERT OR IGNORE INTO resources (id, title, description, long_description, tags, files, images, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
      resources.forEach(r => {
        stmt.run(r.id, r.title, r.description, r.longDescription || '', JSON.stringify(r.tags || []), JSON.stringify(r.files || []), JSON.stringify(r.images || []), r.timestamp);
      });
      console.log(`✅ Migrated ${resources.length} resources`);
    }

    // Migrate events
    const eventsFile = path.join(DATA_DIR, 'events.json');
    if (fs.existsSync(eventsFile)) {
      const events = JSON.parse(fs.readFileSync(eventsFile, 'utf8'));
      const stmt = db.prepare('INSERT OR IGNORE INTO events (id, title, description, image, date, time, location, register_link, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
      events.forEach(e => {
        stmt.run(e.id, e.title, e.description, e.image || '', e.date || '', e.time || '', e.location || '', e.registerLink || '', e.timestamp);
      });
      console.log(`✅ Migrated ${events.length} events`);
    }

    // Migrate spotlight
    const spotlightFile = path.join(DATA_DIR, 'spotlight.json');
    if (fs.existsSync(spotlightFile)) {
      const spotlight = JSON.parse(fs.readFileSync(spotlightFile, 'utf8'));
      const stmt = db.prepare('INSERT OR IGNORE INTO spotlight (id, title, description, images, timestamp) VALUES (?, ?, ?, ?, ?)');
      spotlight.forEach(s => {
        stmt.run(s.id, s.title, s.description, JSON.stringify(s.images || []), s.timestamp);
      });
      console.log(`✅ Migrated ${spotlight.length} spotlight items`);
    }

    // Migrate testimonials
    const testimonialsFile = path.join(DATA_DIR, 'testimonials.json');
    if (fs.existsSync(testimonialsFile)) {
      const testimonials = JSON.parse(fs.readFileSync(testimonialsFile, 'utf8'));
      const stmt = db.prepare('INSERT OR IGNORE INTO testimonials (id, name, title, content, image, timestamp) VALUES (?, ?, ?, ?, ?, ?)');
      testimonials.forEach(t => {
        stmt.run(t.id, t.name, t.title, t.content, t.image || '', t.timestamp);
      });
      console.log(`✅ Migrated ${testimonials.length} testimonials`);
    }

    console.log('\n✅ Migration completed successfully!');
    console.log('📊 Database location: /data/feedx.db');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
};

migrateData();
