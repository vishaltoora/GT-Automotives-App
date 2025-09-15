const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { join } = require('path');

module.exports = {
  target: 'node',
  mode: 'production',
  output: {
    path: join(__dirname, 'dist'),
  },
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
      generatePackageJson: true,
    }),
  ],
};
