import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database(path.join(__dirname, 'server', 'night-market.db'));

console.log('--- COOKS SCHEMA ---');
console.log(db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='cooks'").get());

console.log('--- FIRST ROW OF COOKS ---');
console.log(db.prepare("SELECT * FROM cooks LIMIT 1").get());
