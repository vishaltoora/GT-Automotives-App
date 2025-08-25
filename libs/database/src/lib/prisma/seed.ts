import { PrismaClient, RoleName } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create permissions
  console.log('Creating permissions...');
  const permissionMap = new Map<string, any>();
  
  const allPermissions = [
    // User management
    { resource: 'users', action: 'create', description: 'Create new users' },
    { resource: 'users', action: 'read', description: 'View user information' },
    { resource: 'users', action: 'update', description: 'Update user information' },
    { resource: 'users', action: 'delete', description: 'Delete users' },
    
    // Customer management
    { resource: 'customers', action: 'create', description: 'Create new customers' },
    { resource: 'customers', action: 'read', description: 'View customer information' },
    { resource: 'customers', action: 'update', description: 'Update customer information' },
    { resource: 'customers', action: 'delete', description: 'Delete customers' },
    
    // Vehicle management
    { resource: 'vehicles', action: 'create', description: 'Add new vehicles' },
    { resource: 'vehicles', action: 'read', description: 'View vehicle information' },
    { resource: 'vehicles', action: 'update', description: 'Update vehicle information' },
    { resource: 'vehicles', action: 'delete', description: 'Delete vehicles' },
    
    // Tire inventory
    { resource: 'tires', action: 'create', description: 'Add new tire inventory' },
    { resource: 'tires', action: 'read', description: 'View tire inventory' },
    { resource: 'tires', action: 'update', description: 'Update tire inventory' },
    { resource: 'tires', action: 'delete', description: 'Delete tire inventory' },
    
    // Invoice management
    { resource: 'invoices', action: 'create', description: 'Create new invoices' },
    { resource: 'invoices', action: 'read', description: 'View invoices' },
    { resource: 'invoices', action: 'update', description: 'Update invoices' },
    { resource: 'invoices', action: 'delete', description: 'Delete invoices' },
    { resource: 'invoices', action: 'approve', description: 'Approve invoices' },
    
    // Appointment management
    { resource: 'appointments', action: 'create', description: 'Schedule appointments' },
    { resource: 'appointments', action: 'read', description: 'View appointments' },
    { resource: 'appointments', action: 'update', description: 'Update appointments' },
    { resource: 'appointments', action: 'delete', description: 'Cancel appointments' },
    
    // Reports
    { resource: 'reports', action: 'read', description: 'View business reports' },
    { resource: 'reports', action: 'export', description: 'Export reports' },
    
    // Settings
    { resource: 'settings', action: 'read', description: 'View system settings' },
    { resource: 'settings', action: 'update', description: 'Update system settings' },
  ];

  for (const perm of allPermissions) {
    const permission = await prisma.permission.upsert({
      where: {
        resource_action: {
          resource: perm.resource,
          action: perm.action,
        },
      },
      update: {
        description: perm.description,
      },
      create: perm,
    });
    permissionMap.set(`${perm.resource}:${perm.action}`, permission);
  }

  console.log(`✅ Created ${permissionMap.size} permissions`);

  // Create roles
  console.log('Creating roles...');

  // Customer Role
  const customerRole = await prisma.role.upsert({
    where: { name: RoleName.CUSTOMER },
    update: {
      displayName: 'Customer',
      description: 'Vehicle owner with access to personal data',
    },
    create: {
      name: RoleName.CUSTOMER,
      displayName: 'Customer',
      description: 'Vehicle owner with access to personal data',
    },
  });

  // Staff Role
  const staffRole = await prisma.role.upsert({
    where: { name: RoleName.STAFF },
    update: {
      displayName: 'Staff',
      description: 'Technicians and sales representatives',
    },
    create: {
      name: RoleName.STAFF,
      displayName: 'Staff',
      description: 'Technicians and sales representatives',
    },
  });

  // Admin Role
  const adminRole = await prisma.role.upsert({
    where: { name: RoleName.ADMIN },
    update: {
      displayName: 'Administrator',
      description: 'System administrators with full access',
    },
    create: {
      name: RoleName.ADMIN,
      displayName: 'Administrator',
      description: 'System administrators with full access',
    },
  });

  console.log('✅ Created 3 roles');

  // Assign permissions to roles
  console.log('Assigning permissions to roles...');

  // Clear existing role permissions
  await prisma.rolePermission.deleteMany();

  // Customer permissions
  const customerPermissions = [
    'customers:read',     // Own data only (enforced in code)
    'vehicles:read',      // Own vehicles
    'vehicles:create',
    'vehicles:update',
    'invoices:read',      // Own invoices
    'appointments:create',
    'appointments:read',
    'appointments:update',
  ];

  for (const permKey of customerPermissions) {
    const permission = permissionMap.get(permKey);
    if (permission) {
      await prisma.rolePermission.create({
        data: {
          roleId: customerRole.id,
          permissionId: permission.id,
        },
      });
    }
  }

  // Staff permissions (includes all customer permissions plus more)
  const staffPermissions = [
    ...customerPermissions,
    'customers:create',
    'customers:update',
    'vehicles:delete',
    'tires:read',
    'tires:update',
    'invoices:create',
    'invoices:update',
    'appointments:delete',
  ];

  // Remove duplicates
  const uniqueStaffPermissions = [...new Set(staffPermissions)];

  for (const permKey of uniqueStaffPermissions) {
    const permission = permissionMap.get(permKey);
    if (permission) {
      await prisma.rolePermission.create({
        data: {
          roleId: staffRole.id,
          permissionId: permission.id,
        },
      });
    }
  }

  // Admin permissions (all permissions)
  for (const [_, permission] of permissionMap) {
    await prisma.rolePermission.create({
      data: {
        roleId: adminRole.id,
        permissionId: permission.id,
      },
    });
  }

  console.log('✅ Assigned permissions to roles');

  // Create demo users (only in development)
  if (process.env.NODE_ENV === 'development') {
    console.log('Creating demo users...');

    // Demo Admin
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@gtautomotive.com' },
      update: {},
      create: {
        clerkId: 'demo_admin_clerk_id',
        email: 'admin@gtautomotive.com',
        firstName: 'Admin',
        lastName: 'User',
        roleId: adminRole.id,
        isActive: true,
      },
    });
    console.log('✅ Created admin user:', adminUser.email);

    // Vishal Toora - Admin User
    const vishalAdmin = await prisma.user.upsert({
      where: { email: 'vishal.alawalpuria@gmail.com' },
      update: {
        clerkId: 'user_31JM1BAB2lrW82JVPgrbBekTx5H',
      },
      create: {
        clerkId: 'user_31JM1BAB2lrW82JVPgrbBekTx5H',
        email: 'vishal.alawalpuria@gmail.com',
        firstName: 'Vishal',
        lastName: 'Toora',
        roleId: adminRole.id,
        isActive: true,
      },
    });
    console.log('✅ Created admin user:', vishalAdmin.email);

    // Demo Staff
    const staffUser = await prisma.user.upsert({
      where: { email: 'staff@gtautomotive.com' },
      update: {},
      create: {
        clerkId: 'demo_staff_clerk_id',
        email: 'staff@gtautomotive.com',
        firstName: 'Staff',
        lastName: 'Member',
        roleId: staffRole.id,
        isActive: true,
      },
    });
    console.log('✅ Created staff user:', staffUser.email);

    // Demo Customer
    const customerUser = await prisma.user.upsert({
      where: { email: 'customer@example.com' },
      update: {},
      create: {
        clerkId: 'demo_customer_clerk_id',
        email: 'customer@example.com',
        firstName: 'John',
        lastName: 'Doe',
        roleId: customerRole.id,
        isActive: true,
      },
    });

    // Create customer profile for demo customer
    await prisma.customer.upsert({
      where: { userId: customerUser.id },
      update: {},
      create: {
        userId: customerUser.id,
        phone: '+1234567890',
        address: '123 Main St, City, State 12345',
      },
    });

    console.log('✅ Created demo users');

    // Create sample tire inventory
    console.log('Creating sample tire inventory...');
    
    const tireData = [
      {
        brand: 'Michelin',
        size: '225/45R17',
        type: 'SUMMER' as const,
        condition: 'NEW' as const,
        quantity: 20,
        price: 285.99,
        cost: 180.00,
        minStock: 5,
      },
      {
        brand: 'Bridgestone',
        size: '215/60R16',
        type: 'WINTER' as const,
        condition: 'NEW' as const,
        quantity: 15,
        price: 165.99,
        cost: 105.00,
        minStock: 5,
      },
      {
        brand: 'Goodyear',
        size: '245/40R18',
        type: 'PERFORMANCE' as const,
        condition: 'NEW' as const,
        quantity: 12,
        price: 310.99,
        cost: 195.00,
        minStock: 3,
      },
      {
        brand: 'Continental',
        size: '235/65R17',
        type: 'ALL_SEASON' as const,
        condition: 'NEW' as const,
        quantity: 25,
        price: 175.99,
        cost: 110.00,
        minStock: 8,
      },
      {
        brand: 'BF Goodrich',
        size: '265/70R17',
        type: 'OFF_ROAD' as const,
        condition: 'NEW' as const,
        quantity: 10,
        price: 245.99,
        cost: 155.00,
        minStock: 4,
      },
    ];

    for (const tire of tireData) {
      await prisma.tire.create({ data: tire });
    }

    console.log('✅ Created sample tire inventory');
  }

  console.log('🎉 Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });