const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addUser() {
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { clerkId: 'user_32vzzkxNNoQOZ7W8h0FXtVJD17T' }
    });

    if (existingUser) {
      console.log('User already exists:', existingUser);
      return;
    }

    // First find or create the STAFF role
    let staffRole = await prisma.role.findUnique({
      where: { name: 'STAFF' }
    });

    if (!staffRole) {
      staffRole = await prisma.role.create({
        data: {
          name: 'STAFF',
          description: 'Staff member with operational access'
        }
      });
    }

    // Create new user
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
      }
    });

    console.log('Successfully created user:', newUser);
  } catch (error) {
    console.error('Error creating user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addUser();
