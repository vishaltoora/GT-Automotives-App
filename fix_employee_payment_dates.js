/**
 * Fix Employee Payment Dates to PST Timezone
 *
 * Problem: Historical employee payments were stored with UTC timestamps (new Date())
 * This caused payments made at 11 PM PST to appear on the next day
 *
 * Solution: Convert UTC timestamps to PST business timezone
 * Uses the same timezone conversion logic as appointment payments
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://gtadmin:P4dFPF6b5HasYFyrwcgOSfSdb@gt-automotives-db.postgres.database.azure.com:5432/gt_automotive?sslmode=require'
    }
  }
});

/**
 * Convert UTC date to PST/PDT business timezone
 */
function convertToPST(utcDate) {
  if (!utcDate) return null;

  // Convert to PST timezone string, then parse back to Date
  const pstString = utcDate.toLocaleString('en-US', { timeZone: 'America/Vancouver' });
  return new Date(pstString);
}

async function fixEmployeePaymentDates() {
  console.log('================================================================================');
  console.log('FIX EMPLOYEE PAYMENT DATES TO PST TIMEZONE');
  console.log('================================================================================\n');

  try {
    // Get all PAID employee payments with paidAt timestamps
    const payments = await prisma.payment.findMany({
      where: {
        status: 'PAID',
        paidAt: {
          not: null
        }
      },
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        job: {
          select: {
            jobNumber: true,
            title: true
          }
        }
      },
      orderBy: {
        paidAt: 'asc'
      }
    });

    console.log(`Found ${payments.length} paid employee payments\n`);

    if (payments.length === 0) {
      console.log('✓ No payments to fix');
      return;
    }

    console.log('PREVIEW OF CHANGES:');
    console.log('--------------------------------------------------------------------------------');

    let needsUpdate = 0;
    const updates = [];

    for (const payment of payments) {
      const utcDate = payment.paidAt;
      const pstDate = convertToPST(utcDate);

      const utcDateStr = utcDate.toISOString();
      const pstDateStr = pstDate.toISOString();

      // Check if dates are different
      const isDifferent = utcDateStr !== pstDateStr;

      if (isDifferent) {
        needsUpdate++;
        updates.push({
          id: payment.id,
          oldDate: utcDate,
          newDate: pstDate
        });

        console.log(`Payment ID: ${payment.id}`);
        console.log(`  Employee: ${payment.employee?.firstName} ${payment.employee?.lastName}`);
        console.log(`  Job: ${payment.job?.jobNumber} - ${payment.job?.title}`);
        console.log(`  Amount: $${Number(payment.amount).toFixed(2)}`);
        console.log(`  UTC Date:  ${utcDate.toISOString()} (${utcDate.toLocaleString('en-US', { timeZone: 'UTC' })} UTC)`);
        console.log(`  PST Date:  ${pstDate.toISOString()} (${pstDate.toLocaleString('en-US', { timeZone: 'America/Vancouver' })} PST)`);
        console.log('');
      }
    }

    console.log('================================================================================');
    console.log(`Summary: ${needsUpdate} of ${payments.length} payments need timezone correction`);
    console.log('================================================================================\n');

    if (needsUpdate === 0) {
      console.log('✓ All payment dates are already correct!');
      return;
    }

    // Apply updates
    console.log('APPLYING UPDATES...\n');

    let updated = 0;
    let failed = 0;

    for (const update of updates) {
      try {
        await prisma.payment.update({
          where: { id: update.id },
          data: {
            paidAt: update.newDate
          }
        });
        updated++;
        console.log(`✓ Updated payment ${update.id}`);
      } catch (error) {
        failed++;
        console.error(`✗ Failed to update payment ${update.id}:`, error.message);
      }
    }

    console.log('\n================================================================================');
    console.log('FINAL RESULTS:');
    console.log('================================================================================');
    console.log(`✓ Successfully updated: ${updated} payments`);
    if (failed > 0) {
      console.log(`✗ Failed: ${failed} payments`);
    }
    console.log('================================================================================\n');

    // Verify the changes
    console.log('VERIFICATION - Sample of updated payments:');
    console.log('--------------------------------------------------------------------------------');

    const verifyPayments = await prisma.payment.findMany({
      where: {
        id: {
          in: updates.slice(0, 5).map(u => u.id) // Verify first 5
        }
      },
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    for (const payment of verifyPayments) {
      console.log(`Payment ${payment.id}:`);
      console.log(`  Employee: ${payment.employee?.firstName} ${payment.employee?.lastName}`);
      console.log(`  New Date: ${payment.paidAt.toISOString()} (${payment.paidAt.toLocaleString('en-US', { timeZone: 'America/Vancouver' })} PST)`);
      console.log('');
    }

    console.log('✓ FIX COMPLETE!\n');

  } catch (error) {
    console.error('❌ ERROR:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the fix
fixEmployeePaymentDates()
  .then(() => {
    console.log('✓ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
