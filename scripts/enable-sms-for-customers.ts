#!/usr/bin/env tsx

/**
 * Script to enable SMS preferences for existing customers
 * This creates SmsPreference records for all customers with phone numbers
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function enableSmsForCustomers() {
  console.log('🔄 Enabling SMS preferences for existing customers...\n');

  try {
    // Find all customers with phone numbers who don't have SMS preferences
    const customers = await prisma.customer.findMany({
      where: {
        phone: {
          not: null,
        },
      },
      include: {
        smsPreference: true,
      },
    });

    console.log(`Found ${customers.length} customers with phone numbers\n`);

    let created = 0;
    let skipped = 0;

    for (const customer of customers) {
      if (customer.smsPreference) {
        console.log(`⏭️  Skipping ${customer.firstName} ${customer.lastName} - already has SMS preferences`);
        skipped++;
        continue;
      }

      await prisma.smsPreference.create({
        data: {
          customer: {
            connect: { id: customer.id },
          },
          optedIn: true,
          appointmentReminders: true,
          serviceUpdates: true,
          promotional: false,
        },
      });

      console.log(`✅ Created SMS preferences for ${customer.firstName} ${customer.lastName} (${customer.phone})`);
      created++;
    }

    console.log(`\n✅ Done!`);
    console.log(`   Created: ${created}`);
    console.log(`   Skipped: ${skipped}`);
    console.log(`   Total: ${customers.length}\n`);
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

enableSmsForCustomers()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
