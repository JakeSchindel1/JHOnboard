# Supabase Auth Setup Guide

This guide will help you set up Supabase authentication for sending invite links and allowing users to create passwords.

## 1. Configure Supabase Auth Settings

1. Go to your Supabase dashboard: https://app.supabase.com/
2. Select your project
3. Navigate to **Authentication** > **URL Configuration**
4. Add your site URL and redirect URLs:
   - Site URL: `https://yourdomain.com` (or `http://localhost:3000` for local development)
   - Redirect URLs: 
     - `https://yourdomain.com/reset-password`
     - `https://yourdomain.com/api/auth/callback`

## 2. Configure Email Templates

1. Go to **Authentication** > **Email Templates**
2. Edit the **Invite User** template:
   - Make sure it includes the variable `{{ .ConfirmationURL }}`
   - Customize the message to welcome your users
   - Example: "You've been invited to Journey House. Click the button below to set your password and access your account."

## 3. Sending Invites via the Supabase Dashboard

To manually invite users:

1. Go to **Authentication** > **Users**
2. Click **Invite User**
3. Enter the user's email address
4. Click **Send Invite**

The user will receive an email with a link to your `/reset-password` page.

## 4. Sending Invites Programmatically

To send invites from your application:

```typescript
// Example code for sending invites
const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
  redirectTo: 'https://yourdomain.com/reset-password',
  data: {
    role: 'staff' // Add any custom metadata
  }
});

if (error) {
  console.error('Error inviting user:', error);
} else {
  console.log('Invite sent successfully');
}
```

**Note:** You'll need admin access to use this API. In production, this should be done through a secure admin panel or a server-side API.

## 5. Security Best Practices

1. **Never share your service role key**: Keep the `service_role` key secure and never expose it in client-side code.
2. **Use RLS policies**: Set up Row Level Security policies in Supabase to control data access based on user roles.
3. **Rate limiting**: Implement rate limiting on your authentication endpoints to prevent brute force attacks.
4. **Password requirements**: Enforce strong passwords (our form requires at least 8 characters).

## 6. Testing the Flow

1. Send an invite to your email.
2. Click the link in the email - it should open the `/reset-password` page with a token in the URL.
3. Set a password that meets the requirements.
4. Upon success, you'll be redirected to the login page.
5. Log in with your email and the password you just set.

## Troubleshooting

- **Invalid token errors**: Invite links expire after 24 hours. If a user gets this error, send them a new invite.
- **Redirect issues**: Double-check that your redirect URLs are correctly configured in Supabase.
- **CORS errors**: If you encounter CORS errors, ensure your site URL is correctly set in Supabase. 