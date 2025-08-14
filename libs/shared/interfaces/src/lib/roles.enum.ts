export enum RoleName {
  CUSTOMER = 'CUSTOMER',
  STAFF = 'STAFF',
  ADMIN = 'ADMIN',
}

export enum Resource {
  USERS = 'users',
  CUSTOMERS = 'customers',
  VEHICLES = 'vehicles',
  TIRES = 'tires',
  INVOICES = 'invoices',
  APPOINTMENTS = 'appointments',
  REPORTS = 'reports',
  SETTINGS = 'settings',
}

export enum Action {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  EXPORT = 'export',
  APPROVE = 'approve',
}