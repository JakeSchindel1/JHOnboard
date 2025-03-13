/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  generateEtags: false,
  distDir: '.next',
  output: 'export',
  trailingSlash: true,
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_PDF_FUNCTION_URL: process.env.PDF_FUNCTION_URL || 'https://jhonboard-func.azurewebsites.net/api/generatepdf'
  }
}

module.exports = nextConfig