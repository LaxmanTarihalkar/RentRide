# FlexiCar Email Setup - Quick Start

## 🚀 5-Minute Setup with Gmail

### 1. Set Up Database (2 minutes)

1. Go to [supabase.com](https://supabase.com) → Create project
2. Go to SQL Editor
3. Copy/paste contents of `server/database/schema.sql`
4. Click "Run"

### 2. Configure Gmail (2 minutes)

1. Enable 2FA on your Gmail account
2. Go to [Google Account](https://myaccount.google.com/security) → 2-Step Verification
3. Scroll to "App passwords" → Generate new password for "Mail"
4. Copy the 16-character password

### 3. Set Up Environment (1 minute)

```bash
cp .env.example .env
```

Edit `.env` and add:

```env
# Supabase
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key

# JWT (use any random string)
JWT_SECRET=my-super-secret-random-string-12345

# URLs
FRONTEND_URL=http://localhost:8080
VITE_API_URL=http://localhost:3001

# Gmail SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-char-app-password
SMTP_FROM_NAME=FlexiCar
SMTP_FROM_EMAIL=your-email@gmail.com

# Server
PORT=3001
```

### 4. Start Everything

```bash
npm install
npm run dev:all
```

### 5. Test It!

1. Open http://localhost:8080
2. Click "Get Started"
3. Sign up with your email
4. Check your Gmail inbox
5. Click verification link
6. Sign in!

## ✅ Done!

Your FlexiCar app now has:
- ✅ Custom email verification
- ✅ Beautiful email templates
- ✅ Password reset via email
- ✅ Secure authentication
- ✅ Welcome emails

## 📧 Email Templates Included

1. **Verification Email** - Sent on signup
2. **Welcome Email** - Sent after verification
3. **Password Reset** - Sent on forgot password

All emails are:
- Beautifully designed
- Mobile responsive
- Branded with FlexiCar theme
- Include both HTML and text versions

## 🔧 Troubleshooting

**Emails not sending?**
- Make sure you used App Password (not regular password)
- Check 2FA is enabled on Gmail
- Verify SMTP_USER and SMTP_PASS are correct

**Database errors?**
- Run the schema.sql in Supabase
- Check SUPABASE_SERVICE_KEY (not anon key)

**Can't connect to API?**
- Make sure both servers are running (npm run dev:all)
- Check VITE_API_URL is http://localhost:3001

## 📚 Full Documentation

See `NODEMAILER_SETUP.md` for:
- Other email providers (SendGrid, Mailgun, AWS SES)
- Production deployment
- Email customization
- Security best practices
- API documentation

---

Happy coding! 🚗💨