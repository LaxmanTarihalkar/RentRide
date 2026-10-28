import fetch from 'node-fetch';

const API_URL = 'http://localhost:3001/api/auth/signup';

const signup = async (data) => {
    console.log(`Testing signup with email: ${data.email}`);
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        const result = await response.json();
        console.log(`Status: ${response.status}`);
        console.log('Response:', JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('Error:', error.message);
    }
};

const run = async () => {
    // Test 1: Valid new user
    console.log('\n--- Test 1: Valid New User ---');
    await signup({
        email: `test_${Date.now()}@example.com`,
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
    });

    // Test 2: Existing User (Admin)
    console.log('\n--- Test 2: Existing User (Admin) ---');
    await signup({
        email: 'admin@rentride.com',
        password: 'password123',
        firstName: 'Admin',
        lastName: 'User'
    });

    // Test 3: Missing Fields
    console.log('\n--- Test 3: Missing Fields ---');
    await signup({
        email: 'incomplete@example.com',
        password: 'password123'
        // Missing firstName, lastName
    });
};

run();
