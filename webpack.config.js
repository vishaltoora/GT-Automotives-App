const { composePlugins, withNx } = require('@nx/webpack');
const path = require('node:path');

// Nx plugins for webpack - Single root configuration
module.exports = composePlugins(withNx(), (config) => {
  // Note: This was added by an Nx migration. Webpack builds are required to have a corresponding Webpack config file.
  // See: https://nx.dev/recipes/webpack/webpack-config-setup

  // Set target to Node.js
  config.target = 'node';

  // Enable inline source maps for debugging
  config.devtool = 'inline-source-map';

  // Use TypeScript loader instead of babel for .ts files
  config.module = config.module || {};
  config.module.rules = config.module.rules || [];
  config.module.rules = config.module.rules.filter(rule =>
    !(rule.test && rule.test.toString().includes('tsx?'))
  );

  config.module.rules.push({
    test: /\.tsx?$/,
    use: [{
      loader: 'ts-loader',
      options: {
        transpileOnly: true,
        configFile: path.resolve(__dirname, 'tsconfig.webpack.json')
      }
    }],
    exclude: /node_modules/,
  });

  // Set entry point explicitly for server (server/src/main.ts)
  config.entry = path.resolve(__dirname, 'server/src/main.ts');

  config.output = {
    ...config.output,
    path: path.resolve(__dirname, 'dist/server'),
    filename: 'main.js',
    devtoolModuleFilenameTemplate: (info) => {
      const relativePath = path.relative(process.cwd(), info.absoluteResourcePath);
      return `webpack:///${relativePath}`;
    },
  };

  // Ensure source maps are included
  config.module = config.module || {};
  config.module.rules = config.module.rules || [];

  // CRITICAL: Only externalize Prisma and optional NestJS modules
  // This is what makes the working build work!
  config.externals = {
    '@prisma/client': 'commonjs @prisma/client',
    '.prisma/client': 'commonjs .prisma/client',
    '@nestjs/websockets/socket-module': 'commonjs @nestjs/websockets/socket-module',
    '@nestjs/microservices/microservices-module': 'commonjs @nestjs/microservices/microservices-module',
    '@nestjs/microservices': 'commonjs @nestjs/microservices',
  };

  return config;
});