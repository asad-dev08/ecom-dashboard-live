import fs from 'fs';
import db from './generateData.js';

fs.writeFileSync('./db.json', JSON.stringify(db, null, 2));
console.log('Mock database generated successfully!'); 