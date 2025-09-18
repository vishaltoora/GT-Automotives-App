const { composePlugins, withNx } = require('@nx/webpack');
const path = require('path');

module.exports = composePlugins(withNx(), (config) => {
  // Set the correct output path
  config.output = {
    ...config.output,
    path: path.join(__dirname, '../dist/server'),
    filename: 'main.js',
  };

  // Externalize modules that should not be bundled
  config.externals = {
    '@prisma/client': 'commonjs @prisma/client',
    '.prisma/client': 'commonjs .prisma/client',
    '@gt-automotive/shared-dto': 'commonjs @gt-automotive/shared-dto',
  };

  return config;
});
