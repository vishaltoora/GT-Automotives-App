const { composePlugins, withNx } = require('@nx/webpack');
const path = require('node:path');

// Nx plugins for webpack - MyPersn pattern with shared library fix
module.exports = composePlugins(withNx(), (config) => {
  // Note: This was added by an Nx migration. Webpack builds are required to have a corresponding Webpack config file.
  // See: https://nx.dev/recipes/webpack/webpack-config-setup

  // Enable inline source maps for debugging
  config.devtool = 'inline-source-map';

  config.output = {
    ...config.output,
    devtoolModuleFilenameTemplate: (info) => {
      const relativePath = path.relative(process.cwd(), info.absoluteResourcePath);
      return `webpack:///${relativePath}`;
    },
  };

  // Ensure source maps are included
  config.module = config.module || {};
  config.module.rules = config.module.rules || [];

  // CRITICAL: Externalize shared libraries for Docker deployment
  // These will be available in node_modules at runtime
  config.externals = {
    '@prisma/client': 'commonjs @prisma/client',
    '.prisma/client': 'commonjs .prisma/client',
    '@nestjs/websockets/socket-module': 'commonjs @nestjs/websockets/socket-module',
    '@nestjs/microservices/microservices-module': 'commonjs @nestjs/microservices/microservices-module',
    '@nestjs/microservices': 'commonjs @nestjs/microservices',
    '@gt-automotive/shared-dto': 'commonjs @gt-automotive/shared-dto',
  };

  return config;
});