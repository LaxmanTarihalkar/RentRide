import fetch from 'node-fetch';

const API_URL = 'http://localhost:3001/api/auth/login';

const login = async (email, password) => {
    console.log(`Testing login for: ${email}`);
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        const result = await response.json();
        console.log(`Status: ${response.status}`);
        if (result.success) {
            console.log('✅ Login Successful');
            console.log('User:', result.data.user.email);
            console.log('Role:', result.data.user.role);
        } else {
            console.log('❌ Login Failed');
            console.log('Message:', result.message);
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
};

const run = async () => {
    await login('admin@rentride.com', 'admin123');
};

run();
