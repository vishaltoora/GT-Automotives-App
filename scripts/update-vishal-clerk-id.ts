import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateVishalClerkId() {
  try {
    console.log('Updating Vishal Toora\'s Clerk ID...');
    
    const updatedUser = await prisma.user.update({
      where: {
        email: 'vishal.alawalpuria@gmail.com'
      },
      data: {
        clerkId: 'user_31JM1BAB2lrW82JVPgrbBekTx5H'
      }
    });
    
    console.log('✅ Successfully updated Clerk ID for:', updatedUser.email);
    console.log('User details:', {
      id: updatedUser.id,
      email: updatedUser.email,
      clerkId: updatedUser.clerkId,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      roleId: updatedUser.roleId
    });
  } catch (error) {
    console.error('❌ Error updating Clerk ID:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

updateVishalClerkId();