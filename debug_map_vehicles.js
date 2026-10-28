import fetch from 'node-fetch';

const API_URL = 'http://localhost:3001/api/vehicles/public';

async function checkVehicles() {
    try {
        console.log(`Fetching from ${API_URL}...`);
        const response = await fetch(API_URL);
        const data = await response.json();

        if (data.success) {
            console.log(`Found ${data.data.length} vehicles.`);
            data.data.forEach(v => {
                console.log(`Vehicle: ${v.brand} ${v.model} (ID: ${v.id})`);
                console.log(`  Lat: ${v.latitude}, Long: ${v.longitude}`);
                console.log(`  Location: ${v.location}`);
            });

            const valid = data.data.filter(v => v.latitude && v.longitude);
            console.log(`Valid for map: ${valid.length}`);
        } else {
            console.error('API Error:', data.message);
        }
    } catch (error) {
        console.error('Fetch error:', error);
    }
}

checkVehicles();
