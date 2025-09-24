const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { join } = require('path');

// Nx-recommended webpack configuration for server applications with container deployment fixes
module.exports = {
  output: {
    path: join(__dirname, '../dist/server'),
  },
  devtool: 'source-map',
  // Critical: Webpack externals for Prisma in containers (from container deployment learnings)
  externals: {
    '@prisma/client': 'commonjs @prisma/client',
    '.prisma/client': 'commonjs .prisma/client'
  },
  plugins: [
    new NxAppWebpackPlugin({
      target: 'node',
      compiler: 'tsc',
      main: './src/main.ts',
      tsConfig: './tsconfig.app.json',
      // Critical: Include Prisma assets for container deployment
      assets: [
        './src/assets',
        {
          input: '../libs/database/src/lib/prisma',
          glob: '**',
          output: 'prisma'
        }
      ],
      optimization: false,
      outputHashing: 'none',
      generatePackageJson: true,
    }),
  ],
};
