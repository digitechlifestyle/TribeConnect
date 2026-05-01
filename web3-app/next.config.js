/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  webpack(config) {
    // Stub out @base-org/account — we don't use Coinbase/Base wallet.
    // Its module uses import-assertions syntax unsupported by Next 13's webpack.
    config.resolve.alias["@base-org/account"] = false;

    // Silence the "Can't resolve 'fs'" warning from xrpl.js in browser bundles
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs:   false,
      net:  false,
      tls:  false,
      path: false,
    };

    return config;
  },
};

module.exports = nextConfig;
