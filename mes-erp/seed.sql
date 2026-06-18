-- Seed data for Manufacturing ERP / MES

-- Organizations
INSERT INTO organizations (name, description) VALUES ('Global Manufacturing Corp', 'Leading industrial producer');

-- Plants
INSERT INTO plants (organization_id, name, location) VALUES (1, 'North Plant', 'Chicago, IL');

-- Warehouses
INSERT INTO warehouses (plant_id, name, type) VALUES (1, 'Raw Material WH', 'Raw Material');
INSERT INTO warehouses (plant_id, name, type) VALUES (1, 'Finished Goods WH', 'Finished Goods');

-- Product Categories
INSERT INTO product_categories (name, description) VALUES ('Electronics', 'Electronic components and assemblies');
INSERT INTO product_categories (name, description) VALUES ('Mechanical', 'Mechanical parts and hardware');

-- Products
INSERT INTO products (product_code, name, category_id, unit, cost, selling_price) VALUES ('COMP-001', 'Microcontroller', 1, 'Piece', 5.0, 10.0);
INSERT INTO products (product_code, name, category_id, unit, cost, selling_price) VALUES ('COMP-002', 'PCB Board', 1, 'Piece', 2.0, 5.0);
INSERT INTO products (product_code, name, category_id, unit, cost, selling_price) VALUES ('PRD-1001', 'Industrial Controller', 1, 'Piece', 50.0, 150.0);

-- BOM (Industrial Controller = 1 Microcontroller + 1 PCB Board)
INSERT INTO bom_headers (product_id, version, is_active) VALUES (3, 'V1.0', 1);
INSERT INTO bom_items (bom_header_id, component_id, quantity, unit) VALUES (1, 1, 1, 'Piece');
INSERT INTO bom_items (bom_header_id, component_id, quantity, unit) VALUES (1, 2, 1, 'Piece');

-- Inventory
INSERT INTO inventory_items (warehouse_id, product_id, quantity, min_quantity) VALUES (1, 1, 1000, 100);
INSERT INTO inventory_items (warehouse_id, product_id, quantity, min_quantity) VALUES (1, 2, 500, 50);
INSERT INTO inventory_items (warehouse_id, product_id, quantity, min_quantity) VALUES (2, 3, 50, 10);

-- Machines
INSERT INTO machines (plant_id, name, code, status) VALUES (1, 'SMT Line 1', 'SMT-01', 'Idle');
INSERT INTO machines (plant_id, name, code, status) VALUES (1, 'Assembly Station A', 'ASSY-A', 'Idle');

-- Vendors
INSERT INTO vendors (name, contact_person, email, phone, rating) VALUES ('TechComponents Inc', 'Alice Smith', 'alice@techcomp.com', '555-0123', 4.8);

-- Employees
INSERT INTO employees (employee_code, name, role, department, salary) VALUES ('EMP-001', 'John Operator', 'Operator', 'Production', 3000);
INSERT INTO employees (employee_code, name, role, department, salary) VALUES ('EMP-002', 'Sarah Manager', 'Plant Manager', 'Management', 6000);
