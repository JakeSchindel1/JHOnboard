# Supabase Setup Guide

This guide will walk you through setting up Supabase for the Journey House Onboarding application.

## Create a Supabase Project

1. Sign up or log in to [Supabase](https://app.supabase.com)
2. Click "New Project" 
3. Enter a name for your project (e.g., "journey-house-onboarding")
4. Set a secure database password (save this somewhere safe)
5. Choose a region closest to your users
6. Click "Create New Project"

## Configure Authentication

1. Go to **Authentication** > **Providers** in the Supabase dashboard
2. Make sure "Email" is enabled
3. Configure email authentication settings:
   - Disable "Confirm email" if you want to confirm users manually
   - Enable/disable "Double confirm email changes" based on your security preferences
   - Set the "Mailer" settings to configure the email that users will receive

## Set Up Password Reset

1. Go to **Authentication** > **URL Configuration**
2. Add your site URL (e.g., `https://yourdomain.com`)
3. Add redirect URLs for authentication:
   - For development: `http://localhost:3000/reset-password`
   - For production: `https://yourdomain.com/reset-password`

## Create Database Tables

You may need additional tables for user profiles and other data. Here's an example SQL script to set up your database:

```sql
-- Create a profiles table linked to auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for Row Level Security
CREATE POLICY "Users can view their own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);
```

## Create Admin User

1. Go to **Authentication** > **Users**
2. Click "Add User"
3. Enter the admin email and password
4. Click "Add User" to create the admin account

## Get API Keys

1. Go to **Project Settings** > **API**
2. Copy the "URL" and "anon" key
3. Add these to your `.env.local` file:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

## Testing Authentication

After setup is complete, test the authentication flow:

1. Run your application locally
2. Try to log in with the admin credentials
3. Test the password reset functionality
4. Verify that protected routes are only accessible when logged in

## Backup and Security

- Regularly backup your Supabase database
- Use secure passwords and store them safely
- For production, consider setting up additional security measures like 2FA for admin accounts

## Troubleshooting

If you encounter issues:

1. Check the Supabase dashboard logs under **Database** > **Logs**
2. Verify your environment variables are correctly set
3. Ensure your application is properly configured to use Supabase
4. Check the browser console for any client-side errors 