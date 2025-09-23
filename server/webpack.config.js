const { composePlugins, withNx } = require('@nx/webpack');
const path = require('node:path');

// Nx plugins for webpack - MyPersn Pattern
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

  // Only externalize Prisma (not shared-dto - let webpack bundle it)
  config.externals = {
    '@prisma/client': 'commonjs @prisma/client',
    '.prisma/client': 'commonjs .prisma/client',
  };

  return config;
});
