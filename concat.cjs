const fs = require('fs');
const path = require('path');

const migrationsDir = path.join(__dirname, 'supabase', 'migrations');
const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

let fullSql = '';
for (const file of files) {
  const content = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
  fullSql += content + '\n\n';
}

fs.writeFileSync(path.join(__dirname, 'full_schema.sql'), fullSql, 'utf8');
console.log('Successfully concatenated files.');
