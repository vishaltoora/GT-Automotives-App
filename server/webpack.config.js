const { composePlugins, withNx } = require('@nx/webpack');
const path = require('path');

// MyPersn-inspired simplified webpack configuration for better monorepo compatibility
module.exports = composePlugins(withNx(), (config) => {
  // Set the correct output path for GT Automotive structure
  config.output = {
    ...config.output,
    path: path.join(__dirname, '../dist/server'),
    filename: 'main.js',
  };

  // Enable source maps for debugging
  config.devtool = 'source-map';

  // Critical: Externalize modules that should not be bundled
  // This prevents webpack from bundling these dependencies
  config.externals = {
    '@prisma/client': 'commonjs @prisma/client',
    '.prisma/client': 'commonjs .prisma/client',
    '@gt-automotive/shared-dto': 'commonjs @gt-automotive/shared-dto',
  };

  // Ensure webpack handles node modules correctly
  config.target = 'node';

  // Optimization settings for production
  config.optimization = {
    ...config.optimization,
    minimize: false, // Don't minify for better debugging
  };

  return config;
});
