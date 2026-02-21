import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Manual .env parser
function loadEnv() {
    const envPath = path.resolve(process.cwd(), '.env');
    if (!fs.existsSync(envPath)) return {};

    const envContent = fs.readFileSync(envPath, 'utf8');
    const env = {};
    envContent.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
            env[key.trim()] = valueParts.join('=').trim().replace(/^['"]|['"]$/g, '');
        }
    });
    return env;
}

const env = loadEnv();
const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const DATA_DIR = path.resolve(process.cwd(), 'data');

async function migrateTable(filename, tableName, mappingFn) {
    const filePath = path.join(DATA_DIR, filename);
    if (!fs.existsSync(filePath)) {
        console.warn(`Warning: File ${filename} not found, skipping table ${tableName}`);
        return;
    }

    console.log(`Migrating ${filename} to ${tableName}...`);
    let data;
    try {
        data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (e) {
        console.error(`Error parsing ${filename}:`, e.message);
        return;
    }

    const records = data.map(mappingFn);

    // Supabase insert in chunks to avoid payload limits
    const chunkSize = 50;
    for (let i = 0; i < records.length; i += chunkSize) {
        const chunk = records.slice(i, i + chunkSize);
        const { error } = await supabase.from(tableName).insert(chunk);
        if (error) {
            console.error(`Error inserting into ${tableName}:`, error.message);
        } else {
            console.log(`Inserted chunk ${i / chunkSize + 1} into ${tableName}`);
        }
    }
}

async function runMigration() {
    // 1. Notifications
    await migrateTable('notifications.json', 'notifications', (item) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        status: item.status || 'published',
        timestamp: item.timestamp || new Date().toISOString()
    }));

    // 2. Updates
    await migrateTable('updates.json', 'updates', (item) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        category: item.category || 'general',
        images: item.images || [],
        priority: item.priority || 'medium',
        timestamp: item.timestamp || new Date().toISOString()
    }));

    // 3. Resources
    await migrateTable('resources.json', 'resources', (item) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        long_description: item.longDescription,
        tags: item.tags || [],
        files: item.files || [],
        images: item.images || [],
        timestamp: item.timestamp || new Date().toISOString()
    }));

    // 4. Events
    await migrateTable('events.json', 'events', (item) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        date: item.date,
        time: item.time,
        location: item.location,
        status: item.status || 'upcoming',
        image: item.image,
        register_link: item.registerLink,
        files: item.files || [],
        is_coming_soon: item.isComingSoon || false,
        timestamp: item.timestamp || new Date().toISOString()
    }));

    // 5. Spotlight
    await migrateTable('spotlight.json', 'spotlight', (item) => ({
        id: item.id,
        title: item.title,
        name: item.name,
        description: item.description,
        role: item.role,
        image: item.image,
        category: item.category,
        year: item.year
    }));

    // 6. Testimonials
    await migrateTable('testimonials.json', 'testimonials', (item) => ({
        id: item.id,
        name: item.name,
        content: item.content,
        role: item.role,
        image: item.image,
        category: item.category
    }));

    // 7. Gallery
    await migrateTable('gallery.json', 'gallery', (item) => ({
        id: item.id,
        title: item.title,
        image: item.image,
        category: item.category,
        date: item.date
    }));

    // 8. Profiles (from users.json)
    await migrateTable('users.json', 'profiles', (item) => ({
        id: item.id,
        username: item.username,
        name: item.name,
        email: item.email,
        phone: item.phone,
        pin: item.pin,
        role: item.username === 'admin' ? 'admin' : 'user',
        created_at: item.created_at || item.createdAt || new Date().toISOString()
    }));

    // 9. Login Logs
    await migrateTable('login-logs.json', 'login_logs', (item) => ({
        username: item.username,
        ip_address: item.ip_address,
        user_agent: item.userAgent,
        success: item.success,
        login_time: item.login_time || new Date().toISOString()
    }));

    console.log('Migration completed!');
}

runMigration().catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
});
