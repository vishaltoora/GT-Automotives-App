const { PrismaClient } = require('./node_modules/@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://gtadmin:P4dFPF6b5HasYFyrwcgOSfSdb@gt-automotives-db.postgres.database.azure.com:5432/gt_automotive?sslmode=require"
    }
  }
});

async function main() {
  const appointmentId = 'cmhidaf6p0081mw01jdyskfub'; // Saurav's appointment

  console.log('='.repeat(80));
  console.log('CORRECTING SAURAV BHARDWAJ PAYMENT - FINAL FIX');
  console.log('='.repeat(80));

  console.log('\nUNDERSTANDING:');
  console.log('-'.repeat(80));
  console.log('- Total service cost: $900');
  console.log('- $740 was paid BEFORE Nov 8 (on a different day)');
  console.log('- $160 was paid ON Nov 8 (final payment)');
  console.log('- On Nov 8, the balance was FULLY PAID (no outstanding)');

  console.log('\nCORRECT APPROACH:');
  console.log('-'.repeat(80));
  console.log('Option 1: Show only $160 on Nov 8');
  console.log('  - paymentAmount: $160 (what was paid on Nov 8)');
  console.log('  - expectedAmount: $160 (this was the remaining balance on Nov 8)');
  console.log('  - Result: Shows $160 collected on Nov 8, fully paid');
  console.log('');
  console.log('Option 2: Create a note explaining the situation');
  console.log('  - Keep it at $160 with expectedAmount $900');
  console.log('  - Add notes explaining $740 was paid earlier');
  console.log('  - Shows as "partially paid" but with note');

  console.log('\nAPPLYING OPTION 1 (RECOMMENDED):');
  console.log('-'.repeat(80));

  // Update the appointment
  const updated = await prisma.appointment.update({
    where: { id: appointmentId },
    data: {
      paymentAmount: 160, // What was paid on Nov 8
      expectedAmount: 160, // What was owed on Nov 8 (remaining balance)
      paymentBreakdown: [
        {
          id: "123ea1ed-a1e9-4406-b166-3a7f0c3355ae",
          amount: 160,
          method: "CASH"
        }
      ],
      paymentNotes: "Final payment of $160. Customer had already paid $740 on an earlier date (before Nov 8). Total service: $900. Fully paid.",
      status: 'COMPLETED'
    }
  });

  console.log('\n✅ UPDATED SUCCESSFULLY!\n');
  console.log('NEW STATE:');
  console.log('-'.repeat(80));
  console.log(`Payment Amount: $${updated.paymentAmount} (paid on Nov 8)`);
  console.log(`Expected Amount: $${updated.expectedAmount} (owed on Nov 8)`);
  console.log(`Payment Date: ${updated.paymentDate.toISOString()}`);
  console.log(`Status: ${updated.status}`);
  console.log(`Notes: ${updated.paymentNotes}`);

  console.log('\n\nIMPACT:');
  console.log('-'.repeat(80));
  console.log('✅ Nov 8 EOD will show: Saurav paid $160 (no outstanding balance)');
  console.log('✅ Appointment shows as FULLY PAID');
  console.log('✅ Note explains that $740 was paid earlier');
  console.log('✅ Total collected on Nov 8 is correct: $160');

  console.log('\n✅ FIX COMPLETE!\n');
}

main()
  .catch((error) => {
    console.error('❌ ERROR:', error.message);
  })
  .finally(() => prisma.$disconnect());
