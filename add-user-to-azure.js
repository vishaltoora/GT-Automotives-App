const { PrismaClient } = require('@prisma/client');

// Use Azure production database connection
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://gtadmin:P4dFPF6b5HasYFyrwcgOSfSdb@gt-automotives-db.postgres.database.azure.com:5432/gt_automotive?sslmode=require"
    }
  }
});

async function addUserToAzure() {
  try {
    console.log('Connecting to Azure database...');
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { clerkId: 'user_32vzzkxNNoQOZ7W8h0FXtVJD17T' }
    });

    if (existingUser) {
      console.log('User already exists in Azure database:', existingUser);
      return;
    }

    // First find or create the STAFF role
    let staffRole = await prisma.role.findUnique({
      where: { name: 'STAFF' }
    });

    if (!staffRole) {
      console.log('Creating STAFF role...');
      staffRole = await prisma.role.create({
        data: {
          name: 'STAFF',
          description: 'Staff member with operational access'
        }
      });
    }

    // Create new user
    console.log('Creating user Lovepreet Singh...');
    const newUser = await prisma.user.create({
      data: {
        clerkId: 'user_32vzzkxNNoQOZ7W8h0FXtVJD17T',
        email: 'brarlovepreet7310@gmail.com',
        firstName: 'Lovepreet',
        lastName: 'Singh',
        role: {
          connect: { id: staffRole.id }
        },
        isActive: true
      },
      include: {
        role: true
      }
    });

    console.log('✅ Successfully created user in Azure database:');
    console.log('   Name:', newUser.firstName, newUser.lastName);
    console.log('   Email:', newUser.email);
    console.log('   Role:', newUser.role.name);
    console.log('   Clerk ID:', newUser.clerkId);
    console.log('   Database ID:', newUser.id);
  } catch (error) {
    console.error('❌ Error creating user in Azure database:', error.message);
    console.error('   Details:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addUserToAzure();
