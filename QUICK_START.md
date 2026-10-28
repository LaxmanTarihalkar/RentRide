# RentRide - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Set Up Supabase

1. **Create a Supabase account**: Go to [supabase.com](https://supabase.com)
2. **Create a new project**: Click "New Project" and fill in the details
3. **Get your credentials**: 
   - Go to Settings → API
   - Copy your Project URL
   - Copy your anon/public key

### Step 3: Configure Environment Variables

1. **Create .env file**:
   ```bash
   cp .env.example .env
   ```

2. **Add your Supabase credentials** to `.env`:
   ```env
   VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### Step 4: Configure Email Authentication in Supabase

1. Go to **Authentication** → **Providers**
2. Make sure **Email** is enabled
3. Enable **Confirm email** (for email verification)
4. Go to **Authentication** → **URL Configuration**
5. Add Site URL: `http://localhost:8080`
6. Add Redirect URLs:
   - `http://localhost:8080/auth/callback`
   - `http://localhost:8080/auth/reset-password`

### Step 5: Start Development Server
```bash
npm run dev
```

### Step 6: Test Authentication

1. Open `http://localhost:8080` in your browser
2. Click "Get Started" to create an account
3. Fill in your details and submit
4. Check your email for verification link
5. Click the verification link
6. Sign in with your credentials

## ✅ You're Done!

Your RentRide app is now running with full authentication! 🎉

## 📖 Next Steps

- **Customize email templates**: See `SUPABASE_SETUP.md`
- **Set up OAuth**: Configure Google/Facebook login
- **Configure SMTP**: Use your own email service
- **Read full docs**: Check `AUTH_FEATURES.md`

## 🆘 Need Help?

- **Detailed Setup**: Read `SUPABASE_SETUP.md`
- **Features Guide**: Read `AUTH_FEATURES.md`
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)

## 🔥 Pro Tips

1. **Use a real email** for testing - you'll need to verify it
2. **Check spam folder** if you don't see verification emails
3. **Use Supabase's built-in SMTP** for development (it's free!)
4. **Set up custom SMTP** before going to production

---

Happy coding! 🚗💨