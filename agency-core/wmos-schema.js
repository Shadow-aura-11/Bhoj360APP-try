/**
 * WMOS Schema — Database definition for Warehouse Management & Operations System.
 */

function initializeWmosSchema(db) {
  db.exec(`
    -- Locations in the warehouse (Aisles, Racks, Shelves, Bins)
    CREATE TABLE IF NOT EXISTS locations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL UNIQUE,
      type TEXT NOT NULL, -- 'shelf', 'dock', 'yard', 'buffer', 'packing'
      zone TEXT,
      aisle TEXT,
      rack TEXT,
      shelf TEXT,
      bin TEXT,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Items / SKUs
    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sku TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      description TEXT,
      category TEXT,
      unit TEXT DEFAULT 'pcs',
      barcode TEXT,
      rfid_tag TEXT,
      weight REAL,
      dimensions TEXT,
      min_stock_level REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Inventory (Stock levels at specific locations)
    CREATE TABLE IF NOT EXISTS inventory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_id INTEGER REFERENCES items(id),
      location_id INTEGER REFERENCES locations(id),
      quantity REAL NOT NULL DEFAULT 0,
      batch_number TEXT,
      expiry_date DATE,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(item_id, location_id, batch_number)
    );

    -- Inbound Shipments (Receiving)
    CREATE TABLE IF NOT EXISTS receipts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      receipt_number TEXT NOT NULL UNIQUE,
      supplier_name TEXT,
      status TEXT DEFAULT 'pending', -- 'pending', 'receiving', 'received', 'cancelled'
      received_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS receipt_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      receipt_id INTEGER REFERENCES receipts(id) ON DELETE CASCADE,
      item_id INTEGER REFERENCES items(id),
      expected_qty REAL NOT NULL,
      received_qty REAL DEFAULT 0,
      status TEXT DEFAULT 'pending'
    );

    -- Outbound Shipments (Shipping)
    CREATE TABLE IF NOT EXISTS shipments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      shipment_number TEXT NOT NULL UNIQUE,
      customer_name TEXT,
      destination_address TEXT,
      status TEXT DEFAULT 'pending', -- 'pending', 'picking', 'packed', 'shipped', 'delivered'
      shipped_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS shipment_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      shipment_id INTEGER REFERENCES shipments(id) ON DELETE CASCADE,
      item_id INTEGER REFERENCES items(id),
      ordered_qty REAL NOT NULL,
      picked_qty REAL DEFAULT 0,
      status TEXT DEFAULT 'pending'
    );

    -- Task Management (Picking, Putaway, Cycle Count, etc.)
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL, -- 'picking', 'putaway', 'cycle_count', 'replenishment'
      priority INTEGER DEFAULT 1,
      status TEXT DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'cancelled'
      assigned_to INTEGER REFERENCES staff(id),
      item_id INTEGER REFERENCES items(id),
      from_location_id INTEGER REFERENCES locations(id),
      to_location_id INTEGER REFERENCES locations(id),
      quantity REAL,
      related_id INTEGER, -- receipt_id or shipment_id
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      started_at DATETIME,
      completed_at DATETIME
    );

    -- Yard and Dock Management
    CREATE TABLE IF NOT EXISTS docks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL UNIQUE,
      type TEXT NOT NULL, -- 'inbound', 'outbound', 'flexible'
      status TEXT DEFAULT 'available', -- 'available', 'occupied', 'out_of_service'
      current_vehicle_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS yard_spots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL UNIQUE,
      status TEXT DEFAULT 'empty', -- 'empty', 'occupied', 'reserved'
      vehicle_id TEXT,
      trailer_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Staff and Labor Management
    CREATE TABLE IF NOT EXISTS staff (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      role TEXT NOT NULL, -- 'manager', 'operator', 'driver'
      pin TEXT NOT NULL,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS labor_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      staff_id INTEGER REFERENCES staff(id),
      task_id INTEGER REFERENCES tasks(id),
      action TEXT, -- 'clock_in', 'clock_out', 'task_start', 'task_complete'
      details TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Equipment Tracking
    CREATE TABLE IF NOT EXISTS equipment (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      type TEXT, -- 'forklift', 'pallet_jack', 'scanner'
      status TEXT DEFAULT 'available', -- 'available', 'in_use', 'maintenance'
      last_maintenance DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Inventory Logs (Audit Trail)
    CREATE TABLE IF NOT EXISTS inventory_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_id INTEGER REFERENCES items(id),
      location_id INTEGER REFERENCES locations(id),
      change_qty REAL NOT NULL,
      type TEXT, -- 'receipt', 'shipment', 'adjustment', 'movement'
      reference_id INTEGER, -- task_id, receipt_id, etc.
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- AI and Forecast results (cached or snapshot)
    CREATE TABLE IF NOT EXISTS forecasts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL, -- 'demand', 'labor'
      target_date DATE NOT NULL,
      forecasted_value REAL NOT NULL,
      confidence_interval TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

module.exports = { initializeWmosSchema };
