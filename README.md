# Journey House Onboarding Application

This application provides an onboarding system for Journey House, allowing users to fill out intake forms and manage participant information securely.

## Authentication

The application uses Supabase for authentication. Users can log in with email and password, and reset their passwords if needed.

### Setting Up Authentication

1. Create a Supabase account and project at [supabase.com](https://supabase.com)
2. Copy the Supabase URL and anon key from your project settings > API
3. Create a `.env.local` file based on the `.env.local.example` file, and fill in your Supabase credentials
4. For development, install the Supabase CLI to run a local Supabase instance (optional)

### User Management

To create the first admin user:

1. Go to your Supabase dashboard
2. Navigate to Authentication > Users
3. Click "Add User" and create a user with email and password
4. Optionally, use the SQL editor to set additional user roles or permissions

### Protected Routes

The application uses a `ProtectedRoute` component to secure pages that require authentication. This component redirects unauthenticated users to the login page.

## Development

### Prerequisites

- Node.js 16.x or higher
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env.local` file with your Supabase credentials
4. Run the development server:
   ```
   npm run dev
   ```

### Additional Authentication Features

The authentication system supports:

- Email and password login
- Password reset via email
- Session persistence across page refreshes
- Protected routes for authenticated content

### Adding Custom Claims or User Metadata

To add custom claims or metadata to users, use the Supabase admin dashboard or update the user profile in your database after authentication.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
