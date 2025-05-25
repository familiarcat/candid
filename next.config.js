/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Temporarily disabled for debugging
  // Optimize package imports for visualization libraries
  experimental: {
    optimizePackageImports: ['d3', 'three', '3d-force-graph'],
  }
}

module.exports = nextConfig