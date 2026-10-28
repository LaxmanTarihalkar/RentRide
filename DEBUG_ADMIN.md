# Admin Route Debug Guide

## ✅ Backend Status: WORKING
- Server running on port 3001
- Admin routes responding correctly
- Admin user exists: `admin@rentride.com` / `admin123`
- Login API working correctly

## 🔍 Frontend Debug Steps:

### 1. Check if Frontend is Running
```bash
npm run dev
# Should start on http://localhost:8080
```

### 2. Test Admin Login Process
1. Go to `http://localhost:8080`
2. Click Login or go to login page
3. Enter credentials:
   - Email: `admin@rentride.com`
   - Password: `admin123`
4. Should redirect to `/admin` after successful login

### 3. Direct Admin Route Test
- Try accessing `http://localhost:8080/admin` directly
- If not logged in, should redirect to home
- If logged in as admin, should show admin dashboard

### 4. Check Browser Console
- Open Developer Tools (F12)
- Check Console tab for any JavaScript errors
- Check Network tab for failed API calls

### 5. Check Auth Context
- After login, check if user role is set to 'admin'
- Check localStorage for auth_token and user data

## 🚨 Common Issues:

### Issue 1: Frontend Not Running
**Solution**: Start the frontend development server
```bash
npm run dev
```

### Issue 2: Not Logged In
**Solution**: Login first with admin credentials

### Issue 3: Role Not Set
**Solution**: Check if database has role column and admin user has role='admin'

### Issue 4: Route Protection
**Solution**: Check ProtectedAdminRoute component and AuthContext

## 🧪 Quick Tests:

### Test 1: API Endpoints
```bash
# Test admin ping
curl http://localhost:3001/api/admin/ping

# Test admin login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@rentride.com","password":"admin123"}'
```

### Test 2: Database Check
Run this SQL in Supabase:
```sql
SELECT email, role, email_verified FROM users WHERE email = 'admin@rentride.com';
```

## 📋 Next Steps:
1. Start frontend server if not running
2. Login with admin credentials
3. Navigate to /admin
4. Check browser console for errors
5. Report specific error messages if any