/** @type {import('next').NextConfig} */
const { i18n } = require("./next-i18next.config");
const nextConfig = {
  // 严格模式
  reactStrictMode: false,
  swcMinify: true,
  i18n
}

module.exports = nextConfig
