/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  generateEtags: false,
  distDir: '.next',
  trailingSlash: true,
  // Add asset prefix to help with static file loading
  assetPrefix: process.env.NODE_ENV === 'production' ? undefined : undefined,
  // Add optimizations for production builds
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Remove x-powered-by header
  poweredByHeader: false,
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_PDF_FUNCTION_URL: process.env.PDF_FUNCTION_URL || 'https://jhonboard-func.azurewebsites.net/api/generatepdf'
  }
}

module.exports = nextConfig