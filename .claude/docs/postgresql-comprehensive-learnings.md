# PostgreSQL Comprehensive Learning Guide

## Overview

PostgreSQL is a powerful, open-source object-relational database system with over 35 years of active development. It has earned a strong reputation for reliability, feature robustness, and performance. This guide covers PostgreSQL fundamentals through advanced concepts, specifically tailored for the GT Automotive application architecture.

## Core Database Concepts

### 1. PostgreSQL Architecture

**Client-Server Model**:
- PostgreSQL uses a client-server architecture
- Server process manages database files, accepts connections, and performs database actions
- Client applications connect to the server to perform database operations

**Key Components**:
- **Postmaster**: Main server process that manages connections
- **Backend Processes**: Individual processes handling client connections
- **Shared Memory**: Communication between backend processes
- **Write-Ahead Logging (WAL)**: Transaction logging for reliability
- **Background Processes**: Maintenance tasks (autovacuum, checkpointer, etc.)

### 2. Database Cluster Structure

```sql
-- Database cluster contains multiple databases
-- Each database contains multiple schemas
-- Each schema contains tables, views, functions, etc.

-- List databases
\l

-- Connect to specific database
\c database_name

-- List schemas
\dn

-- Set search path
SET search_path TO schema_name, public;
```

## Data Types and Storage

### 1. Numeric Types

```sql
-- Integer types
CREATE TABLE numeric_examples (
    small_int SMALLINT,           -- -32,768 to 32,767
    regular_int INTEGER,          -- -2,147,483,648 to 2,147,483,647
    big_int BIGINT,              -- -9,223,372,036,854,775,808 to 9,223,372,036,854,775,807

    -- Auto-incrementing integers
    id SERIAL PRIMARY KEY,        -- Auto-incrementing INTEGER
    big_id BIGSERIAL,            -- Auto-incrementing BIGINT

    -- Precise numeric types
    price NUMERIC(10,2),         -- 10 digits total, 2 decimal places
    percentage DECIMAL(5,3),     -- Same as NUMERIC

    -- Floating point
    approximate REAL,            -- 6 decimal digits precision
    very_precise DOUBLE PRECISION -- 15 decimal digits precision
);

-- Examples
INSERT INTO numeric_examples (small_int, regular_int, price, percentage)
VALUES (100, 50000, 1234.56, 12.345);
```

### 2. Text and Character Types

```sql
CREATE TABLE text_examples (
    -- Fixed length (padded with spaces)
    product_code CHAR(10),

    -- Variable length with limit
    customer_name VARCHAR(100),

    -- Unlimited length text
    description TEXT,

    -- Case-insensitive text (extension)
    email CITEXT
);

-- Text operations
SELECT
    LENGTH('Hello World') as length,           -- 11
    UPPER('hello') as upper_case,             -- HELLO
    LOWER('WORLD') as lower_case,             -- world
    CONCAT('Hello', ' ', 'World') as concat,  -- Hello World
    'Hello' || ' ' || 'World' as concatenate  -- Hello World
FROM dual;
```

### 3. Date and Time Types

```sql
CREATE TABLE datetime_examples (
    -- Date only
    birth_date DATE,

    -- Time only
    meeting_time TIME,
    meeting_time_tz TIME WITH TIME ZONE,

    -- Date and time
    created_at TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,

    -- Time intervals
    duration INTERVAL
);

-- Date/time operations
INSERT INTO datetime_examples VALUES (
    '2024-01-15',                    -- DATE
    '14:30:00',                      -- TIME
    '14:30:00+00',                   -- TIME WITH TIME ZONE
    '2024-01-15 14:30:00',          -- TIMESTAMP
    '2024-01-15 14:30:00+00',       -- TIMESTAMP WITH TIME ZONE
    '2 hours 30 minutes'             -- INTERVAL
);

-- Date functions
SELECT
    NOW() as current_timestamp,
    CURRENT_DATE as today,
    CURRENT_TIME as now_time,
    AGE('2024-01-01', '2020-01-01') as age_interval,
    EXTRACT(YEAR FROM NOW()) as current_year,
    DATE_TRUNC('month', NOW()) as month_start;
```

### 4. JSON and JSONB Types

```sql
CREATE TABLE json_examples (
    id SERIAL PRIMARY KEY,
    metadata JSON,              -- Stores exact copy of input text
    data JSONB                 -- Stores in binary format (more efficient)
);

-- Insert JSON data
INSERT INTO json_examples (metadata, data) VALUES
('{"name": "John", "age": 30}', '{"name": "John", "age": 30, "skills": ["PostgreSQL", "JavaScript"]}');

-- Query JSON data
SELECT
    data->>'name' as name,                    -- Extract as text
    data->'age' as age,                       -- Extract as JSON
    data->'skills'->0 as first_skill,         -- Array element access
    data @> '{"name": "John"}' as has_john    -- Containment check
FROM json_examples;

-- JSONB operators and functions
SELECT
    jsonb_object_keys(data) as keys,          -- Get all keys
    jsonb_array_length(data->'skills') as skill_count,
    data || '{"city": "Vancouver"}' as updated -- Concatenate JSON
FROM json_examples
WHERE data ? 'skills';                        -- Key existence check
```

### 5. Arrays

```sql
CREATE TABLE array_examples (
    id SERIAL PRIMARY KEY,
    tags TEXT[],                    -- Text array
    scores INTEGER[],               -- Integer array
    matrix INTEGER[][]              -- Multi-dimensional array
);

-- Insert array data
INSERT INTO array_examples (tags, scores, matrix) VALUES
(ARRAY['postgresql', 'database'], ARRAY[95, 87, 92], ARRAY[[1,2],[3,4]]);

-- Array operations
SELECT
    tags[1] as first_tag,           -- Array indexing (1-based)
    array_length(tags, 1) as tag_count,
    95 = ANY(scores) as has_95,     -- ANY operator
    tags @> ARRAY['database'] as contains_database,
    array_append(tags, 'sql') as with_sql,
    unnest(tags) as individual_tags -- Convert array to rows
FROM array_examples;
```

## SQL Language Features

### 1. Table Creation and Management

```sql
-- Create table with constraints
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20),
    business_name VARCHAR(100),
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Check constraints
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT valid_phone CHECK (phone ~ '^\+?[1-9]\d{1,14}$')
);

-- Add indexes for performance
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_name ON customers(first_name, last_name);
CREATE INDEX idx_customers_created_at ON customers(created_at);

-- Partial index (only for non-null business names)
CREATE INDEX idx_customers_business ON customers(business_name) WHERE business_name IS NOT NULL;
```

### 2. Advanced Query Techniques

**Common Table Expressions (CTEs)**:
```sql
-- Simple CTE
WITH high_value_customers AS (
    SELECT c.*, SUM(i.total_amount) as lifetime_value
    FROM customers c
    JOIN invoices i ON c.id = i.customer_id
    GROUP BY c.id
    HAVING SUM(i.total_amount) > 5000
)
SELECT * FROM high_value_customers
ORDER BY lifetime_value DESC;

-- Recursive CTE (organizational hierarchy example)
WITH RECURSIVE employee_hierarchy AS (
    -- Base case: top-level managers
    SELECT id, name, manager_id, 1 as level
    FROM employees
    WHERE manager_id IS NULL

    UNION ALL

    -- Recursive case: employees reporting to someone
    SELECT e.id, e.name, e.manager_id, eh.level + 1
    FROM employees e
    INNER JOIN employee_hierarchy eh ON e.manager_id = eh.id
)
SELECT * FROM employee_hierarchy ORDER BY level, name;
```

**Window Functions**:
```sql
-- Window functions for analytics
SELECT
    customer_id,
    invoice_date,
    total_amount,

    -- Running totals
    SUM(total_amount) OVER (
        PARTITION BY customer_id
        ORDER BY invoice_date
        ROWS UNBOUNDED PRECEDING
    ) as running_total,

    -- Row numbers
    ROW_NUMBER() OVER (
        PARTITION BY customer_id
        ORDER BY invoice_date DESC
    ) as invoice_rank,

    -- Moving average
    AVG(total_amount) OVER (
        ORDER BY invoice_date
        ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
    ) as moving_avg,

    -- Percentile ranking
    PERCENT_RANK() OVER (ORDER BY total_amount) as percentile_rank

FROM invoices
ORDER BY customer_id, invoice_date;
```

### 3. Joins and Relationships

```sql
-- Complex join example
SELECT
    c.first_name,
    c.last_name,
    c.business_name,
    i.invoice_date,
    i.total_amount,
    ii.quantity,
    t.brand,
    t.size,
    t.type
FROM customers c
INNER JOIN invoices i ON c.id = i.customer_id
INNER JOIN invoice_items ii ON i.id = ii.invoice_id
INNER JOIN tires t ON ii.tire_id = t.id
WHERE i.invoice_date >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY i.invoice_date DESC, c.last_name;

-- Outer joins for complete data
SELECT
    c.first_name,
    c.last_name,
    COALESCE(invoice_count.count, 0) as total_invoices,
    COALESCE(invoice_total.total, 0) as total_spent
FROM customers c
LEFT JOIN (
    SELECT customer_id, COUNT(*) as count
    FROM invoices
    GROUP BY customer_id
) invoice_count ON c.id = invoice_count.customer_id
LEFT JOIN (
    SELECT customer_id, SUM(total_amount) as total
    FROM invoices
    GROUP BY customer_id
) invoice_total ON c.id = invoice_total.customer_id
ORDER BY total_spent DESC NULLS LAST;
```

## Advanced PostgreSQL Features

### 1. Full-Text Search

```sql
-- Add full-text search capabilities
ALTER TABLE customers ADD COLUMN search_vector tsvector;

-- Update search vector
UPDATE customers SET search_vector =
    to_tsvector('english',
        COALESCE(first_name, '') || ' ' ||
        COALESCE(last_name, '') || ' ' ||
        COALESCE(business_name, '') || ' ' ||
        COALESCE(email, '')
    );

-- Create GIN index for fast full-text search
CREATE INDEX idx_customers_search ON customers USING GIN(search_vector);

-- Full-text search queries
SELECT first_name, last_name, business_name
FROM customers
WHERE search_vector @@ plainto_tsquery('english', 'automotive parts');

-- Ranking search results
SELECT
    first_name,
    last_name,
    business_name,
    ts_rank(search_vector, query) as rank
FROM customers, plainto_tsquery('english', 'john automotive') query
WHERE search_vector @@ query
ORDER BY rank DESC;
```

### 2. Partitioning

```sql
-- Create partitioned table for large datasets
CREATE TABLE invoices_partitioned (
    id UUID DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL,
    invoice_date DATE NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
) PARTITION BY RANGE (invoice_date);

-- Create partitions
CREATE TABLE invoices_2024_q1 PARTITION OF invoices_partitioned
    FOR VALUES FROM ('2024-01-01') TO ('2024-04-01');

CREATE TABLE invoices_2024_q2 PARTITION OF invoices_partitioned
    FOR VALUES FROM ('2024-04-01') TO ('2024-07-01');

-- Automatic partition creation function
CREATE OR REPLACE FUNCTION create_monthly_partition(table_name text, start_date date)
RETURNS void AS $$
DECLARE
    partition_name text;
    end_date date;
BEGIN
    partition_name := table_name || '_' || to_char(start_date, 'YYYY_MM');
    end_date := start_date + interval '1 month';

    EXECUTE format('CREATE TABLE %I PARTITION OF %I FOR VALUES FROM (%L) TO (%L)',
                   partition_name, table_name, start_date, end_date);
END;
$$ LANGUAGE plpgsql;
```

### 3. Stored Procedures and Functions

```sql
-- PL/pgSQL function for business logic
CREATE OR REPLACE FUNCTION calculate_customer_discount(
    customer_id_param UUID,
    base_amount DECIMAL
) RETURNS DECIMAL AS $$
DECLARE
    total_spent DECIMAL;
    discount_rate DECIMAL := 0;
BEGIN
    -- Get customer's lifetime value
    SELECT COALESCE(SUM(total_amount), 0) INTO total_spent
    FROM invoices
    WHERE customer_id = customer_id_param;

    -- Calculate discount based on spending
    IF total_spent >= 10000 THEN
        discount_rate := 0.15;  -- 15% for high-value customers
    ELSIF total_spent >= 5000 THEN
        discount_rate := 0.10;  -- 10% for medium-value customers
    ELSIF total_spent >= 1000 THEN
        discount_rate := 0.05;  -- 5% for regular customers
    END IF;

    RETURN base_amount * discount_rate;
END;
$$ LANGUAGE plpgsql;

-- Usage
SELECT
    first_name,
    last_name,
    calculate_customer_discount(id, 1000.00) as discount
FROM customers;

-- Trigger function for automatic timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables
CREATE TRIGGER update_customers_updated_at
    BEFORE UPDATE ON customers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

## Performance Optimization

### 1. Indexing Strategies

```sql
-- B-tree indexes (default, good for equality and range queries)
CREATE INDEX idx_invoices_date ON invoices(invoice_date);
CREATE INDEX idx_invoices_customer_date ON invoices(customer_id, invoice_date);

-- Partial indexes (smaller, more efficient for filtered queries)
CREATE INDEX idx_invoices_unpaid ON invoices(invoice_date)
WHERE status = 'unpaid';

-- Expression indexes (for computed values)
CREATE INDEX idx_customers_full_name ON customers(LOWER(first_name || ' ' || last_name));

-- GIN indexes (for array and full-text search)
CREATE INDEX idx_tires_features ON tires USING GIN(features);

-- Hash indexes (for equality queries only)
CREATE INDEX idx_customers_email_hash ON customers USING HASH(email);

-- Analyze index usage
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

### 2. Query Optimization

```sql
-- Use EXPLAIN to analyze query performance
EXPLAIN (ANALYZE, BUFFERS)
SELECT c.first_name, c.last_name, SUM(i.total_amount)
FROM customers c
JOIN invoices i ON c.id = i.customer_id
WHERE i.invoice_date >= '2024-01-01'
GROUP BY c.id, c.first_name, c.last_name
ORDER BY SUM(i.total_amount) DESC;

-- Optimize with proper indexing and query structure
-- Instead of SELECT *, be specific about columns
SELECT c.id, c.first_name, c.last_name
FROM customers c
WHERE c.created_at >= '2024-01-01'::date;

-- Use EXISTS instead of IN for better performance with large datasets
SELECT DISTINCT c.*
FROM customers c
WHERE EXISTS (
    SELECT 1 FROM invoices i
    WHERE i.customer_id = c.id
    AND i.total_amount > 1000
);

-- Limit results when possible
SELECT * FROM invoices
ORDER BY invoice_date DESC
LIMIT 100 OFFSET 0;
```

### 3. VACUUM and Maintenance

```sql
-- Manual vacuum operations
VACUUM ANALYZE customers;        -- Clean up and update statistics
VACUUM FULL customers;          -- Reclaim disk space (requires table lock)

-- Analyze table statistics
ANALYZE customers;

-- Reindex for performance
REINDEX INDEX idx_customers_email;
REINDEX TABLE customers;

-- Check table bloat
SELECT
    schemaname,
    tablename,
    n_dead_tup,
    n_live_tup,
    ROUND((n_dead_tup::float / (n_live_tup + n_dead_tup)::float) * 100, 2) as dead_ratio
FROM pg_stat_user_tables
WHERE n_dead_tup > 0
ORDER BY dead_ratio DESC;
```

## Security and User Management

### 1. Role-Based Access Control

```sql
-- Create roles for different access levels
CREATE ROLE gt_automotive_readonly;
CREATE ROLE gt_automotive_staff;
CREATE ROLE gt_automotive_admin;

-- Grant permissions to roles
GRANT CONNECT ON DATABASE gt_automotive TO gt_automotive_readonly;
GRANT USAGE ON SCHEMA public TO gt_automotive_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO gt_automotive_readonly;

-- Staff permissions (read/write on most tables)
GRANT gt_automotive_readonly TO gt_automotive_staff;
GRANT INSERT, UPDATE ON customers, invoices, invoice_items TO gt_automotive_staff;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO gt_automotive_staff;

-- Admin permissions (all privileges)
GRANT gt_automotive_staff TO gt_automotive_admin;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO gt_automotive_admin;

-- Create users and assign roles
CREATE USER app_user WITH PASSWORD 'secure_password';
GRANT gt_automotive_staff TO app_user;

-- Row-level security (RLS)
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Policy for customer data isolation
CREATE POLICY customer_isolation ON customers
FOR ALL TO gt_automotive_staff
USING (created_by = current_user OR has_role('gt_automotive_admin'));
```

### 2. Connection Security

```sql
-- SSL configuration in postgresql.conf
-- ssl = on
-- ssl_cert_file = 'server.crt'
-- ssl_key_file = 'server.key'

-- Client authentication in pg_hba.conf
-- hostssl    all             all             0.0.0.0/0               md5
-- host       all             all             127.0.0.1/32            trust
-- local      all             all                                     peer

-- Connection security checks
SELECT
    datname,
    usename,
    client_addr,
    ssl,
    ssl_cipher
FROM pg_stat_ssl s
JOIN pg_stat_activity a ON s.pid = a.pid
WHERE datname IS NOT NULL;
```

## Backup and Recovery

### 1. Logical Backups with pg_dump

```bash
# Full database backup
pg_dump -h localhost -U postgres -d gt_automotive -F c -f gt_automotive_backup.dump

# Schema-only backup
pg_dump -h localhost -U postgres -d gt_automotive -s -f gt_automotive_schema.sql

# Data-only backup
pg_dump -h localhost -U postgres -d gt_automotive -a -f gt_automotive_data.sql

# Selective table backup
pg_dump -h localhost -U postgres -d gt_automotive -t customers -t invoices -f selective_backup.dump

# Compressed backup with verbose output
pg_dump -h localhost -U postgres -d gt_automotive -F c -Z 9 -v -f gt_automotive_compressed.dump
```

### 2. Restore Operations

```bash
# Restore from custom format backup
pg_restore -h localhost -U postgres -d gt_automotive_new -v gt_automotive_backup.dump

# Restore specific tables
pg_restore -h localhost -U postgres -d gt_automotive -t customers -t invoices gt_automotive_backup.dump

# Restore with data cleaning
pg_restore -h localhost -U postgres -d gt_automotive -c -v gt_automotive_backup.dump

# Restore to different database
createdb -h localhost -U postgres gt_automotive_restore
pg_restore -h localhost -U postgres -d gt_automotive_restore gt_automotive_backup.dump
```

### 3. Continuous Archiving and PITR

```sql
-- Configure WAL archiving in postgresql.conf
-- wal_level = replica
-- archive_mode = on
-- archive_command = 'cp %p /var/lib/postgresql/wal_archive/%f'

-- Create base backup
SELECT pg_start_backup('gt_automotive_base_backup', false, false);
-- Copy data directory
SELECT pg_stop_backup(false, true);

-- Point-in-time recovery setup in recovery.conf
-- restore_command = 'cp /var/lib/postgresql/wal_archive/%f %p'
-- recovery_target_time = '2024-01-15 14:30:00'
-- recovery_target_action = 'promote'
```

## Monitoring and Maintenance

### 1. System Statistics

```sql
-- Database activity
SELECT
    datname,
    numbackends,
    xact_commit,
    xact_rollback,
    blks_read,
    blks_hit,
    tup_returned,
    tup_fetched,
    tup_inserted,
    tup_updated,
    tup_deleted
FROM pg_stat_database
WHERE datname = 'gt_automotive';

-- Table statistics
SELECT
    schemaname,
    tablename,
    n_tup_ins,
    n_tup_upd,
    n_tup_del,
    n_live_tup,
    n_dead_tup,
    last_vacuum,
    last_autovacuum,
    last_analyze,
    last_autoanalyze
FROM pg_stat_user_tables
ORDER BY n_live_tup DESC;

-- Index usage
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

### 2. Performance Monitoring

```sql
-- Long running queries
SELECT
    pid,
    now() - pg_stat_activity.query_start AS duration,
    query,
    state,
    client_addr
FROM pg_stat_activity
WHERE (now() - pg_stat_activity.query_start) > interval '5 minutes'
AND state != 'idle';

-- Lock monitoring
SELECT
    l.locktype,
    l.database,
    l.relation,
    l.page,
    l.tuple,
    l.virtualxid,
    l.transactionid,
    l.mode,
    l.granted,
    a.query
FROM pg_locks l
LEFT JOIN pg_stat_activity a ON l.pid = a.pid
WHERE NOT l.granted;

-- Connection monitoring
SELECT
    client_addr,
    client_port,
    state,
    COUNT(*)
FROM pg_stat_activity
WHERE datname = 'gt_automotive'
GROUP BY client_addr, client_port, state
ORDER BY count DESC;
```

## GT Automotive Specific Patterns

### 1. Customer Data Model

```sql
-- Customer table optimized for GT Automotive
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    business_name VARCHAR(100),
    address TEXT DEFAULT 'Prince George, BC',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    search_vector tsvector,

    -- Constraints
    CONSTRAINT customers_email_check CHECK (
        email IS NULL OR
        email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    )
);

-- Indexes for performance
CREATE INDEX idx_customers_name ON customers(last_name, first_name);
CREATE INDEX idx_customers_email ON customers(email) WHERE email IS NOT NULL;
CREATE INDEX idx_customers_business ON customers(business_name) WHERE business_name IS NOT NULL;
CREATE INDEX idx_customers_search ON customers USING GIN(search_vector);
```

### 2. Invoice and Transaction Management

```sql
-- Invoice system with proper constraints
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
    gst_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft', 'sent', 'paid', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Ensure financial calculations are correct
    CONSTRAINT invoice_totals_check CHECK (
        total_amount = subtotal + gst_amount AND
        subtotal >= 0 AND
        gst_amount >= 0
    )
);

-- Automatic total calculation trigger
CREATE OR REPLACE FUNCTION calculate_invoice_totals()
RETURNS TRIGGER AS $$
BEGIN
    -- Recalculate totals from invoice items
    SELECT
        COALESCE(SUM(line_total), 0),
        COALESCE(SUM(line_total * 0.05), 0)  -- 5% GST
    INTO NEW.subtotal, NEW.gst_amount
    FROM invoice_items
    WHERE invoice_id = NEW.id;

    NEW.total_amount := NEW.subtotal + NEW.gst_amount;
    NEW.updated_at := NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_invoice_totals
    BEFORE UPDATE ON invoices
    FOR EACH ROW
    EXECUTE FUNCTION calculate_invoice_totals();
```

### 3. Tire Inventory Management

```sql
-- Tire inventory with proper categorization
CREATE TABLE tires (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand VARCHAR(50) NOT NULL,
    size VARCHAR(20) NOT NULL,
    type VARCHAR(20) NOT NULL
        CHECK (type IN ('All Season', 'Winter', 'Summer', 'All Terrain', 'Mud Terrain')),
    condition VARCHAR(10) NOT NULL DEFAULT 'New'
        CHECK (condition IN ('New', 'Used')),
    price DECIMAL(8,2) NOT NULL CHECK (price >= 0),
    cost DECIMAL(8,2) CHECK (cost >= 0),
    quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    location VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Ensure profit margin
    CONSTRAINT price_cost_check CHECK (cost IS NULL OR price >= cost)
);

-- Indexes for inventory searches
CREATE INDEX idx_tires_brand_size ON tires(brand, size);
CREATE INDEX idx_tires_type ON tires(type);
CREATE INDEX idx_tires_condition ON tires(condition);
CREATE INDEX idx_tires_quantity ON tires(quantity) WHERE quantity > 0;

-- Full-text search for tire descriptions
CREATE INDEX idx_tires_search ON tires USING GIN(
    to_tsvector('english', brand || ' ' || size || ' ' || type || ' ' || COALESCE(notes, ''))
);
```

## Best Practices for GT Automotive

### 1. Data Integrity

```sql
-- Ensure referential integrity
ALTER TABLE invoices
ADD CONSTRAINT fk_invoices_customer
FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE;

-- Use check constraints for business rules
ALTER TABLE invoices
ADD CONSTRAINT valid_invoice_date
CHECK (invoice_date >= '2020-01-01' AND invoice_date <= CURRENT_DATE + INTERVAL '30 days');

-- Use NOT NULL for required fields
ALTER TABLE customers ALTER COLUMN first_name SET NOT NULL;
ALTER TABLE customers ALTER COLUMN last_name SET NOT NULL;
```

### 2. Performance Optimization

```sql
-- Regular maintenance schedule
DO $$
BEGIN
    -- Auto-vacuum configuration
    ALTER SYSTEM SET autovacuum = on;
    ALTER SYSTEM SET autovacuum_vacuum_scale_factor = 0.1;
    ALTER SYSTEM SET autovacuum_analyze_scale_factor = 0.05;

    -- Performance tuning
    ALTER SYSTEM SET shared_buffers = '256MB';
    ALTER SYSTEM SET effective_cache_size = '1GB';
    ALTER SYSTEM SET work_mem = '4MB';
    ALTER SYSTEM SET maintenance_work_mem = '64MB';
END $$;

-- Monitor and optimize slow queries
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
```

### 3. Backup Strategy

```sql
-- Automated backup script (run via cron)
-- 0 2 * * * /usr/bin/pg_dump -h localhost -U postgres -d gt_automotive -F c -f /backups/gt_automotive_$(date +\%Y\%m\%d).dump

-- Retention policy cleanup
-- 0 3 * * 0 find /backups -name "gt_automotive_*.dump" -mtime +30 -delete
```

---

**Last Updated**: September 24, 2025
**Status**: Comprehensive PostgreSQL documentation covering fundamentals through advanced features
**Coverage**: Data types, SQL queries, performance optimization, security, backup/recovery, GT Automotive patterns
**Source**: Official PostgreSQL 17 documentation + GT Automotive specific implementations

This comprehensive guide provides a solid foundation for PostgreSQL development and administration in the GT Automotive application context, covering everything from basic concepts to advanced optimization techniques.