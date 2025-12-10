/** @type {import('next').NextConfig} */
const nextConfig = {
  typedRoutes: true,
  outputFileTracingRoot: require("path").join(__dirname),
};

module.exports = nextConfig;
