import fetch from 'node-fetch';

const API_URL = 'http://localhost:3001/api/auth/signup';

const signup = async (label, data) => {
    console.log(`\n--- Test: ${label} ---`);
    console.log(`Signup with email: ${data.email}, role: ${data.role}`);
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        const result = await response.json();
        console.log(`Status: ${response.status}`);

        // If successful, we want to know what role was actually saved? 
        // The signup response might not return the role, so we might need to check the DB or login.
        // But let's check the response data first.
        console.log('Response:', JSON.stringify(result, null, 2));

    } catch (error) {
        console.error('Error:', error.message);
    }
};

const run = async () => {
    // Test 1: New User (Customer)
    await signup('New User Role', {
        email: `user_${Date.now()}@test.com`,
        password: 'password123',
        firstName: 'Regular',
        lastName: 'Customer',
        role: 'user'
    });

    // Test 2: New Owner
    await signup('New Owner Role', {
        email: `owner_${Date.now()}@test.com`,
        password: 'password123',
        firstName: 'Car',
        lastName: 'Owner',
        role: 'owner'
    });
};

run();
