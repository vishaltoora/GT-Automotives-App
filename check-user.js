// Quick script to check if user exists in Azure database
const { PrismaClient } = require('@prisma/client');

async function checkUser() {
  // Connect to Azure production database
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: "postgresql://gtadmin:P4dFPF6b5HasYFyrwcgOSfSdb@gt-automotives-db.postgres.database.azure.com:5432/gt_automotive?sslmode=require"
      }
    }
  });
  
  try {
    console.log('Connecting to database...');
    
    // Check if user exists
    const user = await prisma.user.findFirst({
      where: {
        email: 'vishal.alawalpuria@gmail.com'
      },
      select: {
        id: true,
        clerkId: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        lastLogin: true,
        isActive: true
      }
    });
    
    if (user) {
      console.log('✅ User found:');
      console.log('ID:', user.id);
      console.log('Clerk ID:', user.clerkId);
      console.log('Email:', user.email);
      console.log('Name:', user.firstName, user.lastName);
      console.log('Role:', user.role);
      console.log('Active:', user.isActive);
      console.log('Last Login:', user.lastLogin);
      console.log('Created:', user.createdAt);
    } else {
      console.log('❌ User not found with email: vishal.alawalpuria@gmail.com');
      
      // Check all users
      const allUsers = await prisma.user.findMany({
        select: {
          email: true,
          clerkId: true,
          role: true,
          isActive: true
        }
      });
      
      console.log('\nAll users in Azure database:');
      allUsers.forEach((u, i) => {
        console.log(`${i + 1}. ${u.email} (${u.clerkId}) - ${u.role} - Active: ${u.isActive}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();