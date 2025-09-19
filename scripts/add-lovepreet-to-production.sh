#!/bin/bash

echo "Adding Lovepreet Singh to production database..."

# This script should be run from the production environment or CI/CD pipeline
DATABASE_URL="postgresql://gtadmin:P4dFPF6b5HasYFyrwcgOSfSdb@gt-automotives-db.postgres.database.azure.com:5432/gt_automotive?sslmode=require"

# Create a temporary Node.js script
cat > /tmp/add-prod-user.js << 'SCRIPT'
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    // Check if user exists
    const existing = await prisma.user.findUnique({
      where: { clerkId: 'user_32vzzkxNNoQOZ7W8h0FXtVJD17T' }
    });

    if (existing) {
      console.log('User already exists:', existing.email);
      return;
    }

    // Get STAFF role
    let role = await prisma.role.findUnique({
      where: { name: 'STAFF' }
    });

    if (!role) {
      role = await prisma.role.create({
        data: { name: 'STAFF', description: 'Staff member' }
      });
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        clerkId: 'user_32vzzkxNNoQOZ7W8h0FXtVJD17T',
        email: 'brarlovepreet7310@gmail.com',
        firstName: 'Lovepreet',
        lastName: 'Singh',
        roleId: role.id,
        isActive: true
      }
    });

    console.log('Successfully created user:', user.email);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
SCRIPT

# Run the script
DATABASE_URL="$DATABASE_URL" node /tmp/add-prod-user.js

# Clean up
rm /tmp/add-prod-user.js

echo "Done!"
