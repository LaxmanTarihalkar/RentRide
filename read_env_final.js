import fs from 'fs';
const env = fs.readFileSync('.env', 'utf8');
console.log('ENV_START');
console.log(env);
console.log('ENV_END');
