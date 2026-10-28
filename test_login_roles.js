import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3001/api/auth';

const testRole = async (roleName, roleValue) => {
    const email = `${roleName}_${Date.now()}@test.com`;
    const password = 'password123';

    console.log(`\n--- Testing Role: ${roleName} ---`);

    // 1. Signup
    console.log(`1. Signing up ${email}...`);
    const signupRes = await fetch(`${BASE_URL}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email,
            password,
            firstName: 'Test',
            lastName: roleName,
            role: roleValue
        })
    });

    if (!signupRes.ok) {
        console.error('Signup failed:', await signupRes.text());
        return;
    }

    // 2. Login
    console.log('2. Logging in...');
    const loginRes = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });

    const loginData = await loginRes.json();

    if (loginData.success) {
        console.log('✅ Login Successful');
        console.log(`User Role from API: '${loginData.data.user.role}'`);

        if (loginData.data.user.role === roleValue) {
            console.log(`✅ Role match verified: ${roleValue}`);
        } else {
            console.log(`❌ Role mismatch! Expected ${roleValue}, got ${loginData.data.user.role}`);
            // Note: 'user' might be mapped to 'customer' by backend, check expectation
            if (roleValue === 'user' && loginData.data.user.role === 'customer') {
                console.log('✅ Mapped correctly (user -> customer)');
            }
        }
    } else {
        console.log('❌ Login Failed:', loginData.message);
    }
};

const run = async () => {
    await testRole('Owner', 'owner');
    await testRole('Customer', 'user'); // 'user' should become 'customer' in backend
};

run();
