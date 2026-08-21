/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Compile the TS-only workspace package on the fly.
  transpilePackages: ['@corporate-blabla/core'],
};

module.exports = nextConfig;
