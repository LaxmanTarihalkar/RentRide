import fs from 'fs';
try {
    const content = fs.readFileSync('.env', 'utf8');
    const match = content.match(/https:\/\/([a-z0-9]+)\.supabase\.co/);
    if (match) {
        console.log('PROJECT_ID_FOUND:', match[1]);
    } else {
        console.log('PROJECT_ID_NOT_FOUND_IN_URL');
        // Print the lines containing 'SUPABASE_URL' to debug
        const lines = content.split('\n').filter(l => l.includes('SUPABASE_URL'));
        console.log('URL_LINES:', lines);
    }
} catch (e) {
    console.error(e);
}
