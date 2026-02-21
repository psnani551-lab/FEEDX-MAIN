import bcrypt from 'bcryptjs';
import fs from 'fs';

const password = 'admin123';
const hash = await bcrypt.hash(password, 10);

// Verify it works
const matches = await bcrypt.compare(password, hash);
console.log('Hash generated:', hash);
console.log('Verification test:', matches ? '✅ PASS' : '❌ FAIL');

const users = [
  {
    id: "admin001",
    username: "admin",
    email: "admin@feedx.com",
    name: "Administrator",
    password: hash,
    created_at: new Date().toISOString()
  }
];

// Write to the correct location - data/users.json (where server reads from)
fs.writeFileSync('./data/users.json', JSON.stringify(users, null, 2));
console.log('\n✅ data/users.json reset with admin/admin123');
