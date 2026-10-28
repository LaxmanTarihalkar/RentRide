import fs from 'fs';
const content = fs.readFileSync('.env', 'utf8');
console.log('--- START .env CONTENT ---');
console.log(content);
console.log('--- END .env CONTENT ---');
// Also inspect keys specifically for hidden chars
const lines = content.split('\n');
lines.forEach((line, i) => {
    if (line.includes('KEY') || line.includes('URL')) {
        console.log(`Line ${i}: [${line}] length=${line.length}`);
    }
});
