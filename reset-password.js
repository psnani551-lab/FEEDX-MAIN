import bcrypt from 'bcryptjs';
import fs from 'fs';

const newPassword = 'admin123';
const hash = await bcrypt.hash(newPassword, 10);

console.log('Generated hash for "admin123":', hash);

// Read users.json
const users = JSON.parse(fs.readFileSync('./server/users.json', 'utf8'));

// Update all passwords to admin123
users.forEach(user => {
  user.password = hash;
  console.log(`Reset password for user: ${user.username || user.email}`);
});

// Write back
fs.writeFileSync('./server/users.json', JSON.stringify(users, null, 2));
console.log('\n✅ All passwords reset to: admin123');
