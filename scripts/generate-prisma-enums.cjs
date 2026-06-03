#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const schemaPath = path.join(rootDir, 'libs/database/src/lib/prisma/schema.prisma');
const outputPath = path.join(rootDir, 'libs/data/src/lib/prisma-enums.ts');
const checkOnly = process.argv.includes('--check');

function parseEnums(schema) {
  const enums = [];
  const enumBlockPattern = /^enum\s+(\w+)\s*\{([\s\S]*?)^}/gm;
  let match;

  while ((match = enumBlockPattern.exec(schema)) !== null) {
    const [, name, body] = match;
    const values = body
      .split('\n')
      .map((line) => line.replace(/\/\/.*$/, '').trim())
      .filter(Boolean)
      .filter((line) => !line.startsWith('@@') && !line.startsWith('@'))
      .map((line) => line.split(/\s+/)[0])
      .filter((value) => /^[A-Za-z_][A-Za-z0-9_]*$/.test(value));

    enums.push({ name, values });
  }

  return enums;
}

function formatEnum({ name, values }) {
  const entries = values.map((value) => `  ${value}: '${value}',`).join('\n');

  return `export const ${name} = {\n${entries}\n} as const;\nexport type ${name} = (typeof ${name})[keyof typeof ${name}];`;
}

function generateFile(enums) {
  return [
    '// This file is generated from libs/database/src/lib/prisma/schema.prisma.',
    '// Run `yarn enums:generate` after changing Prisma enums.',
    '',
    ...enums.map(formatEnum),
    '',
  ].join('\n\n');
}

const schema = fs.readFileSync(schemaPath, 'utf8');
const generated = generateFile(parseEnums(schema));

if (checkOnly) {
  const current = fs.existsSync(outputPath) ? fs.readFileSync(outputPath, 'utf8') : '';

  if (current !== generated) {
    console.error('Prisma enum mirror is out of date. Run `yarn enums:generate`.');
    process.exit(1);
  }

  console.log('Prisma enum mirror is up to date.');
  process.exit(0);
}

fs.writeFileSync(outputPath, generated);
console.log(`Generated ${path.relative(rootDir, outputPath)} from ${path.relative(rootDir, schemaPath)}.`);
