# Supabase Authentication Setup Guide

This guide will help you set up Supabase authentication with email verification for RentRide.

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Fill in your project details:
   - **Name**: RentRide
   - **Database Password**: Choose a strong password
   - **Region**: Select closest to your users
4. Click "Create new project" and wait for it to initialize

## Step 2: Get Your API Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (under Project URL)
   - **anon/public key** (under Project API keys)

## Step 3: Configure Environment Variables

1. Create a `.env` file in your project root (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

2. Add your Supabase credentials to `.env`:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

## Step 4: Configure Email Authentication

### Enable Email Provider
1. Go to **Authentication** → **Providers** in your Supabase dashboard
2. Make sure **Email** is enabled
3. Configure email settings:
   - **Enable email confirmations**: ON (for email verification)
   - **Secure email change**: ON (recommended)
   - **Secure password change**: ON (recommended)

### Configure Email Templates
1. Go to **Authentication** → **Email Templates**
2. Customize the following templates:
   - **Confirm signup**: Email sent when users sign up
   - **Magic Link**: For passwordless login (optional)
   - **Change Email Address**: When users change email
   - **Reset Password**: For password reset

### Example Confirmation Email Template:
```html
<h2>Welcome to RentRide!</h2>
<p>Thanks for signing up! Please confirm your email address by clicking the link below:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm your email</a></p>
<p>If you didn't create an account, you can safely ignore this email.</p>
```

## Step 5: Configure SMTP (Optional but Recommended)

By default, Supabase uses their SMTP server with rate limits. For production, use your own SMTP:

1. Go to **Settings** → **Auth** → **SMTP Settings**
2. Enable **Custom SMTP**
3. Configure your SMTP provider (examples below)

### Using Gmail SMTP:
```
Host: smtp.gmail.com
Port: 587
Username: your-email@gmail.com
Password: your-app-password (not your regular password)
Sender email: your-email@gmail.com
Sender name: RentRide
```

**Note**: For Gmail, you need to create an [App Password](https://support.google.com/accounts/answer/185833)

### Using SendGrid:
```
Host: smtp.sendgrid.net
Port: 587
Username: apikey
Password: your-sendgrid-api-key
Sender email: noreply@yourdomain.com
Sender name: RentRide
```

### Using AWS SES:
```
Host: email-smtp.us-east-1.amazonaws.com
Port: 587
Username: your-ses-smtp-username
Password: your-ses-smtp-password
Sender email: noreply@yourdomain.com
Sender name: RentRide
```

## Step 6: Configure URL Redirects

1. Go to **Authentication** → **URL Configuration**
2. Add your site URL:
   - **Site URL**: `http://localhost:8080` (for development)
   - For production, add your production URL: `https://yourdomain.com`

3. Add redirect URLs (for OAuth and email confirmations):
   - `http://localhost:8080/auth/callback`
   - `http://localhost:8080/auth/reset-password`
   - Add production URLs when deploying

## Step 7: Set Up Database Tables (Optional)

If you want to store additional user profile data:

1. Go to **SQL Editor** in Supabase
2. Run this SQL to create a profiles table:

```sql
-- Create profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  first_name text,
  last_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- Create policies
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Create function to handle new user creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, first_name, last_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger for new user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

## Step 8: Configure OAuth Providers (Optional)

### Google OAuth:
1. Go to **Authentication** → **Providers** → **Google**
2. Enable Google provider
3. Follow the instructions to create OAuth credentials in Google Cloud Console
4. Add your Client ID and Client Secret

### Facebook OAuth:
1. Go to **Authentication** → **Providers** → **Facebook**
2. Enable Facebook provider
3. Follow the instructions to create a Facebook App
4. Add your App ID and App Secret

## Step 9: Test Your Setup

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Try signing up with a new account
3. Check your email for the verification link
4. Click the verification link to confirm your account
5. Try logging in with your verified account

## Step 10: Production Checklist

Before deploying to production:

- [ ] Update Site URL to your production domain
- [ ] Add production redirect URLs
- [ ] Configure custom SMTP (don't rely on Supabase SMTP in production)
- [ ] Customize email templates with your branding
- [ ] Enable RLS (Row Level Security) on all tables
- [ ] Set up proper database backups
- [ ] Configure rate limiting
- [ ] Test email delivery thoroughly
- [ ] Set up monitoring and error tracking

## Troubleshooting

### Emails not being sent:
- Check SMTP configuration
- Verify sender email is verified with your SMTP provider
- Check Supabase logs in **Logs** → **Auth Logs**
- Ensure you haven't hit rate limits

### Email confirmation not working:
- Verify redirect URLs are correctly configured
- Check that "Enable email confirmations" is ON
- Make sure the confirmation URL in the email is correct

### Users can't sign in after verification:
- Check if email is confirmed in **Authentication** → **Users**
- Verify the user's email_confirmed_at field is set
- Check browser console for errors

## Support

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase Discord Community](https://discord.supabase.com)

## Security Best Practices

1. **Never commit your `.env` file** - It's already in `.gitignore`
2. **Use Row Level Security (RLS)** on all database tables
3. **Rotate your API keys** if they're ever exposed
4. **Use strong password policies** in Auth settings
5. **Enable MFA** for admin accounts
6. **Monitor auth logs** regularly for suspicious activity
7. **Set up rate limiting** to prevent abuse
8. **Use HTTPS** in production (always)

---

Your RentRide authentication system is now ready! 🚗✨