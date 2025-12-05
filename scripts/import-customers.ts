/**
 * Customer Import Script
 *
 * Imports customers from Square CSV export to production database.
 * - Matches by phone OR email to avoid duplicates
 * - Updates existing customers with new info
 * - Creates new customers if no match found
 *
 * Usage:
 *   DATABASE_URL="postgresql://..." npx ts-node scripts/import-customers.ts /path/to/file.csv
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface CsvRow {
  'First Name': string;
  'Surname': string;
  'Email Address': string;
  'Phone Number': string;
  'Company Name': string;
  'Street Address 1': string;
  'Street Address 2': string;
  'City': string;
  'State': string;
  'Postal Code': string;
}

// Clean phone number: remove '+1 prefix and any non-digits
function cleanPhone(phone: string): string | null {
  if (!phone) return null;
  // Remove '+1 prefix and any quotes
  let cleaned = phone.replace(/^['"]?\+?1?/, '').replace(/['"]$/, '');
  // Keep only digits
  cleaned = cleaned.replace(/\D/g, '');
  // Must be 10 digits for valid phone
  if (cleaned.length === 10) {
    return cleaned;
  }
  // If 11 digits starting with 1, remove the 1
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return cleaned.substring(1);
  }
  return cleaned.length >= 10 ? cleaned.substring(0, 10) : null;
}

// Build full address from components
function buildAddress(row: CsvRow): string | null {
  const parts: string[] = [];

  if (row['Street Address 1']?.trim()) {
    parts.push(row['Street Address 1'].trim());
  }
  if (row['Street Address 2']?.trim()) {
    parts.push(row['Street Address 2'].trim());
  }

  const cityStateZip: string[] = [];
  if (row['City']?.trim()) {
    cityStateZip.push(row['City'].trim());
  }
  if (row['State']?.trim()) {
    cityStateZip.push(row['State'].trim());
  }
  if (row['Postal Code']?.trim()) {
    cityStateZip.push(row['Postal Code'].trim());
  }

  if (cityStateZip.length > 0) {
    parts.push(cityStateZip.join(', '));
  }

  return parts.length > 0 ? parts.join(', ') : null;
}

// Parse CSV manually (handles quoted fields with commas)
function parseCSV(content: string): CsvRow[] {
  const lines = content.split('\n');
  const headers = parseCSVLine(lines[0]);
  const rows: CsvRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Handle multi-line fields (memo field can have newlines)
    let fullLine = line;
    while (fullLine.split('"').length % 2 === 0 && i + 1 < lines.length) {
      i++;
      fullLine += '\n' + lines[i];
    }

    const values = parseCSVLine(fullLine);
    const row: any = {};

    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });

    rows.push(row as CsvRow);
  }

  return rows;
}

// Parse a single CSV line handling quoted fields
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

async function importCustomers(csvPath: string) {
  console.log('🚀 Starting customer import...\n');

  // Read CSV file
  const absolutePath = path.resolve(csvPath);
  if (!fs.existsSync(absolutePath)) {
    console.error(`❌ File not found: ${absolutePath}`);
    process.exit(1);
  }

  const content = fs.readFileSync(absolutePath, 'utf-8');
  const rows = parseCSV(content);

  console.log(`📄 Found ${rows.length} rows in CSV\n`);

  let created = 0;
  let updated = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const row of rows) {
    const firstName = row['First Name']?.trim() || '';
    const lastName = row['Surname']?.trim() || '';
    const email = row['Email Address']?.trim().toLowerCase() || null;
    const phone = cleanPhone(row['Phone Number']);
    const businessName = row['Company Name']?.trim() || null;
    const address = buildAddress(row);

    // Skip if no identifying info
    if (!firstName && !lastName && !phone && !email) {
      console.log(`⏭️  Skipping row with no name/phone/email`);
      skipped++;
      continue;
    }

    // Skip test entries
    if (firstName.toLowerCase() === 'text' || firstName.toLowerCase() === 'gt') {
      console.log(`⏭️  Skipping test entry: ${firstName}`);
      skipped++;
      continue;
    }

    // Use firstName as lastName if only firstName exists and it looks like a full name
    let finalFirstName = firstName || 'Unknown';
    let finalLastName = lastName || '';

    // If surname is just a period, ignore it
    if (finalLastName === '.') {
      finalLastName = '';
    }

    try {
      // Find existing customer by phone OR email
      let existingCustomer = null;

      if (phone) {
        existingCustomer = await prisma.customer.findFirst({
          where: { phone }
        });
      }

      if (!existingCustomer && email) {
        existingCustomer = await prisma.customer.findFirst({
          where: { email: { equals: email, mode: 'insensitive' } }
        });
      }

      if (existingCustomer) {
        // Update existing customer
        await prisma.customer.update({
          where: { id: existingCustomer.id },
          data: {
            // Only update if new value exists and old is empty
            firstName: existingCustomer.firstName || finalFirstName,
            lastName: existingCustomer.lastName || finalLastName,
            email: existingCustomer.email || email,
            phone: existingCustomer.phone || phone,
            address: existingCustomer.address || address,
            businessName: existingCustomer.businessName || businessName,
          }
        });
        console.log(`✏️  Updated: ${finalFirstName} ${finalLastName} (${phone || email})`);
        updated++;
      } else {
        // Create new customer
        await prisma.customer.create({
          data: {
            firstName: finalFirstName,
            lastName: finalLastName,
            email: email || undefined,
            phone: phone || undefined,
            address: address || undefined,
            businessName: businessName || undefined,
          }
        });
        console.log(`✅ Created: ${finalFirstName} ${finalLastName} (${phone || email})`);
        created++;
      }
    } catch (error: any) {
      const errorMsg = `❌ Error for ${finalFirstName} ${finalLastName}: ${error.message}`;
      console.error(errorMsg);
      errors.push(errorMsg);
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('📊 Import Summary:');
  console.log(`   ✅ Created: ${created}`);
  console.log(`   ✏️  Updated: ${updated}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log(`   ❌ Errors: ${errors.length}`);
  console.log('='.repeat(50));

  if (errors.length > 0) {
    console.log('\n❌ Errors:');
    errors.forEach(e => console.log(`   ${e}`));
  }
}

// Run the import
const csvPath = process.argv[2];
if (!csvPath) {
  console.error('Usage: DATABASE_URL="..." npx ts-node scripts/import-customers.ts /path/to/file.csv');
  process.exit(1);
}

importCustomers(csvPath)
  .catch(console.error)
  .finally(() => prisma.$disconnect());
