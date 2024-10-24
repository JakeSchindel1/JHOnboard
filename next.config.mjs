/** @type {import('next').NextConfig} */
const nextConfig = {
    // Remove the standalone output since Amplify handles deployment differently
    images: {
      unoptimized: true,
      // If you're using remote images, you'll need to add domains here
      // domains: ['your-domain.com'],
    },
    // This helps prevent issues with Static Site Generation in Amplify
    generateEtags: false,
  }
  
  module.exports = nextConfig