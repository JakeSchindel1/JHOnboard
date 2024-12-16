/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  generateEtags: false,
  distDir: '.next',
  experimental: {
    appDir: true,
  }
}

module.exports = nextConfig