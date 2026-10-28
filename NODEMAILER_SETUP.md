# FlexiCar - Nodemailer Email Setup Guide

Complete guide to set up custom email authentication with Nodemailer for FlexiCar.

## 📋 Prerequisites

- Node.js installed (v18 or higher)
- Supabase account (for database only)
- Email service provider (Gmail, SendGrid, Mailgun, or AWS SES)

## 🚀 Quick Setup (5 Steps)

### Step 1: Set Up Supabase Database

1. Go to [supabase.com](https://supabase.com) and create a project
2. Go to **SQL Editor** in your Supabase dashboard
3. Copy and paste the contents of `server/database/schema.sql`
4. Click "Run" to create the tables

### Step 2: Configure Environment Variables

1. Copy the example file:
   ```bash
   cp .env.example .env
   ```

2. Fill in your `.env` file with these values:

```env
# Supabase (for database only)
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key

# JWT Secret (generate a random string)
JWT_SECRET=your-super-secret-random-string-here

# URLs
FRONTEND_URL=http://localhost:8080
VITE_API_URL=http://localhost:3001

# Email Configuration (choose one option below)
```

### Step 3: Choose Your Email Provider

#### Option A: Gmail (Easiest for Testing)

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to [Google Account Settings](https://myaccount.google.com/security)
   - Click "2-Step Verification"
   - Scroll down to "App passwords"
   - Generate a new app password for "Mail"
3. Add to `.env`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-character-app-password
SMTP_FROM_NAME=FlexiCar
SMTP_FROM_EMAIL=your-email@gmail.com
```

#### Option B: SendGrid (Best for Production)

1. Sign up at [sendgrid.com](https://sendgrid.com)
2. Create an API key:
   - Go to Settings → API Keys
   - Create API Key with "Mail Send" permissions
3. Verify your sender email/domain
4. Add to `.env`:

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
SMTP_FROM_NAME=FlexiCar
SMTP_FROM_EMAIL=noreply@yourdomain.com
```

#### Option C: Mailgun

1. Sign up at [mailgun.com](https://mailgun.com)
2. Get your SMTP credentials from the dashboard
3. Add to `.env`:

```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=postmaster@yourdomain.com
SMTP_PASS=your-mailgun-password
SMTP_FROM_NAME=FlexiCar
SMTP_FROM_EMAIL=noreply@yourdomain.com
```

#### Option D: AWS SES

1. Set up AWS SES and verify your domain
2. Create SMTP credentials in AWS SES console
3. Add to `.env`:

```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-ses-smtp-username
SMTP_PASS=your-ses-smtp-password
SMTP_FROM_NAME=FlexiCar
SMTP_FROM_EMAIL=noreply@yourdomain.com
```

### Step 4: Install Dependencies

```bash
npm install
```

### Step 5: Start Both Servers

```bash
# Start both frontend and backend together
npm run dev:all

# Or start them separately:
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - Backend API
npm run server
```

## ✅ Test Your Setup

1. Open `http://localhost:8080` in your browser
2. Click "Get Started" to sign up
3. Fill in your details and submit
4. Check your email for the verification link
5. Click the verification link
6. You should see a success message
7. Sign in with your credentials

## 📧 Email Templates

The system sends three types of emails:

### 1. Verification Email
- Sent when user signs up
- Contains verification link
- Expires in 24 hours
- Beautiful HTML template with FlexiCar branding

### 2. Password Reset Email
- Sent when user requests password reset
- Contains reset link
- Expires in 1 hour
- Security warning included

### 3. Welcome Email
- Sent after email verification
- Welcomes user to FlexiCar
- Lists available features
- Call-to-action to browse cars

## 🎨 Customize Email Templates

Edit `server/config/email.js` to customize:

- Email subject lines
- HTML templates
- Text versions
- Branding colors
- Logo and images

Example customization:
```javascript
verification: (name, verificationLink) => ({
  subject: 'Welcome to FlexiCar - Verify Your Email',
  html: `
    <!-- Your custom HTML here -->
  `,
  text: `Your custom text version here`,
}),
```

## 🔒 Security Features

- **Password Hashing**: bcrypt with 10 rounds
- **JWT Tokens**: 7-day expiration
- **Email Verification**: Required before login
- **Token Expiration**: 
  - Email verification: 24 hours
  - Password reset: 1 hour
- **One-time Tokens**: Tokens can only be used once
- **Secure Storage**: Passwords never stored in plain text

## 🗄️ Database Schema

### Users Table
```sql
- id (UUID, primary key)
- email (unique, not null)
- password (hashed, not null)
- first_name (not null)
- last_name (not null)
- email_verified (boolean, default false)
- created_at (timestamp)
- updated_at (timestamp)
```

### Verification Tokens Table
```sql
- id (UUID, primary key)
- user_id (foreign key to users)
- token (unique, not null)
- type (email_verification or password_reset)
- used (boolean, default false)
- used_at (timestamp)
- expires_at (timestamp, not null)
- created_at (timestamp)
```

## 🔧 API Endpoints

### POST /api/auth/signup
Register a new user and send verification email.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Account created! Please check your email to verify your account.",
  "data": {
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

### POST /api/auth/login
Sign in with email and password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Signed in successfully",
  "data": {
    "token": "jwt-token-here",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "emailVerified": true
    }
  }
}
```

### GET /api/auth/verify-email?token=xxx
Verify user's email address.

### POST /api/auth/resend-verification
Resend verification email.

### POST /api/auth/forgot-password
Request password reset email.

### POST /api/auth/reset-password
Reset password with token.

### GET /api/auth/me
Get current user (requires JWT token).

## 🐛 Troubleshooting

### Emails Not Sending

**Gmail:**
- Make sure 2FA is enabled
- Use App Password, not regular password
- Check "Less secure app access" is OFF
- Verify email in Gmail settings

**SendGrid:**
- Verify your sender email/domain
- Check API key permissions
- Ensure you're not in sandbox mode
- Check SendGrid activity logs

**General:**
- Check SMTP credentials are correct
- Verify SMTP_PORT is correct (usually 587)
- Check firewall isn't blocking port 587
- Look at server console for error messages

### Database Errors

- Verify Supabase credentials are correct
- Check if tables were created (run schema.sql)
- Ensure SERVICE_KEY is used (not anon key)
- Check Supabase logs for errors

### JWT Errors

- Make sure JWT_SECRET is set in .env
- JWT_SECRET should be a long random string
- Don't use spaces in JWT_SECRET
- Restart server after changing JWT_SECRET

### CORS Errors

- Verify FRONTEND_URL matches your frontend URL
- Check if both servers are running
- Clear browser cache
- Try in incognito mode

## 📊 Monitoring

### Check Server Health
```bash
curl http://localhost:3001/health
```

### View Server Logs
The server logs all email sends and errors to console.

### Database Cleanup
Run this periodically to clean up expired tokens:
```sql
SELECT cleanup_expired_tokens();
```

## 🚀 Production Deployment

### Environment Variables
Update these for production:
```env
FRONTEND_URL=https://yourdomain.com
VITE_API_URL=https://api.yourdomain.com
JWT_SECRET=very-long-random-production-secret
```

### Email Provider
- Use SendGrid, Mailgun, or AWS SES (not Gmail)
- Verify your domain
- Set up SPF, DKIM, and DMARC records
- Monitor email delivery rates

### Security
- Use HTTPS everywhere
- Set secure JWT_SECRET
- Enable rate limiting
- Set up monitoring and alerts
- Regular database backups
- Keep dependencies updated

### Server Deployment
Deploy your backend to:
- Heroku
- Railway
- Render
- AWS EC2
- DigitalOcean
- Vercel (serverless functions)

## 📚 Additional Resources

- [Nodemailer Documentation](https://nodemailer.com)
- [Express.js Guide](https://expressjs.com)
- [JWT Best Practices](https://jwt.io/introduction)
- [Supabase Documentation](https://supabase.com/docs)

## 🎉 You're All Set!

Your FlexiCar authentication system with custom email is now ready!

- ✅ User registration with email verification
- ✅ Secure password storage
- ✅ JWT-based authentication
- ✅ Password reset functionality
- ✅ Beautiful email templates
- ✅ Production-ready architecture

Happy coding! 🚗💨