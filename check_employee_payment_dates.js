/**
 * Check Employee Payment Dates in Production
 * Verify if any payments still need PST timezone correction
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://gtadmin:P4dFPF6b5HasYFyrwcgOSfSdb@gt-automotives-db.postgres.database.azure.com:5432/gt_automotive?sslmode=require'
    }
  }
});

async function checkEmployeePaymentDates() {
  console.log('================================================================================');
  console.log('CHECK EMPLOYEE PAYMENT DATES IN PRODUCTION');
  console.log('================================================================================\n');

  try {
    // Get all PAID employee payments
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
        paidAt: 'desc'
      }
    });

    console.log(`Found ${payments.length} paid employee payments\n`);

    if (payments.length === 0) {
      console.log('✓ No payments found');
      return;
    }

    console.log('ALL EMPLOYEE PAYMENTS:');
    console.log('================================================================================\n');

    for (const payment of payments) {
      const paidAt = payment.paidAt;

      // Show date in both UTC and PST
      const utcStr = paidAt.toISOString();
      const pstStr = paidAt.toLocaleString('en-US', {
        timeZone: 'America/Vancouver',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });

      // Extract just the date part in PST
      const pstDateOnly = paidAt.toLocaleString('en-US', {
        timeZone: 'America/Vancouver',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });

      console.log(`Payment ID: ${payment.id}`);
      console.log(`  Employee: ${payment.employee?.firstName} ${payment.employee?.lastName}`);
      console.log(`  Job: ${payment.job?.jobNumber} - ${payment.job?.title}`);
      console.log(`  Amount: $${Number(payment.amount).toFixed(2)}`);
      console.log(`  Method: ${payment.paymentMethod}`);
      console.log(`  Paid At (ISO): ${utcStr}`);
      console.log(`  Paid At (PST): ${pstStr}`);
      console.log(`  PST Date: ${pstDateOnly}`);

      // Check if hour component suggests this might be a UTC timestamp
      const hour = paidAt.getUTCHours();
      if (hour >= 0 && hour <= 8) {
        console.log(`  ⚠️  WARNING: Timestamp hour is ${hour} UTC - might need PST conversion`);
      } else {
        console.log(`  ✓ Timestamp appears correct`);
      }

      console.log('');
    }

    console.log('================================================================================');
    console.log('CHECK COMPLETE');
    console.log('================================================================================\n');

  } catch (error) {
    console.error('❌ ERROR:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the check
checkEmployeePaymentDates()
  .then(() => {
    console.log('✓ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
