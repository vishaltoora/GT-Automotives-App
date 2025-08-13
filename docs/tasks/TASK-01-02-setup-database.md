# Task: Set up PostgreSQL/MySQL Database

## Parent Epic
[EPIC-01: Project Setup & Infrastructure](../epics/EPIC-01-project-setup.md)

## Description
Install and configure the database server for development and create the initial database.

## Acceptance Criteria
- [ ] PostgreSQL or MySQL installed locally
- [ ] Database server is running
- [ ] Database user created with appropriate permissions
- [ ] Development database created (e.g., `gt_automotive_dev`)
- [ ] Test database created (e.g., `gt_automotive_test`)
- [ ] Connection tested from backend application
- [ ] Database configuration added to backend config files
- [ ] Environment variables set up for database credentials

## Technical Details

### PostgreSQL Setup
```sql
-- Create database
CREATE DATABASE gt_automotive_dev;
CREATE DATABASE gt_automotive_test;

-- Create user
CREATE USER gt_app_user WITH PASSWORD 'secure_password';

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE gt_automotive_dev TO gt_app_user;
GRANT ALL PRIVILEGES ON DATABASE gt_automotive_test TO gt_app_user;
```

### Environment Variables (.env)
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gt_automotive_dev
DB_USER=gt_app_user
DB_PASSWORD=secure_password
```

## Estimated Time
3 hours

## Dependencies
- TASK-01-01: Initialize Project Repository Structure

## Labels
- task
- database
- backend
- priority:high

## Notes
- Choose PostgreSQL for better JSON support and performance
- Ensure database backups are configured from the start
- Document the database setup process for team members