const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { join } = require('path');

// Hybrid approach: Use NxAppWebpackPlugin for proper TypeScript compilation
// but with simplified externals configuration (MyPersn-inspired)
module.exports = {
  output: {
    path: join(__dirname, '../dist/server'),
  },
  devtool: 'source-map',

  // Critical: Webpack externals for shared libraries and Prisma (from MyPersn pattern)
  externals: {
    '@prisma/client': 'commonjs @prisma/client',
    '.prisma/client': 'commonjs .prisma/client',
    '@gt-automotive/shared-dto': 'commonjs @gt-automotive/shared-dto',
  },

  plugins: [
    new NxAppWebpackPlugin({
      target: 'node',
      compiler: 'tsc',
      main: './src/main.ts',
      tsConfig: './tsconfig.app.json',
      assets: ['./src/assets'],
      optimization: false,
      outputHashing: 'none',
      // Enable package.json generation for better container deployment
      generatePackageJson: true,
    }),
  ],
};
