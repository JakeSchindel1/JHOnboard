/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  generateEtags: false,
  distDir: '.next',
  output: 'standalone',
}

module.exports = nextConfig