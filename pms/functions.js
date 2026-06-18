// Functions for Property Management System (PMS)

function manageLeases(db) {
  return {
    createLease: (data) => {
      const { unit_id, tenant_id, start_date, end_date, rent_amount, deposit_amount } = data;
      const stmt = db.prepare('INSERT INTO leases (unit_id, tenant_id, start_date, end_date, rent_amount, deposit_amount, status) VALUES (?, ?, ?, ?, ?, ?, ?)');
      return stmt.run(unit_id, tenant_id, start_date, end_date, rent_amount, deposit_amount, 'Active');
    },
    getLeaseHistory: (tenant_id) => {
      return db.prepare('SELECT * FROM leases WHERE tenant_id = ? ORDER BY start_date DESC').all(tenant_id);
    }
  };
}

function manageUnits(db) {
  return {
    updateStatus: (unit_id, status) => {
      return db.prepare('UPDATE units SET status = ? WHERE id = ?').run(status, unit_id);
    },
    listByProperty: (property_id) => {
      return db.prepare('SELECT u.* FROM units u JOIN floors f ON u.floor_id = f.id JOIN buildings b ON f.building_id = b.id WHERE b.property_id = ?').all(property_id);
    }
  };
}

function manageAssets(db) {
  return {
    trackMaintenance: (asset_id, date, type, cost, notes) => {
      const stmt = db.prepare('INSERT INTO asset_maintenance (asset_id, maintenance_date, type, cost, notes) VALUES (?, ?, ?, ?, ?)');
      return stmt.run(asset_id, date, type, cost, notes);
    },
    listByProperty: (property_id) => {
      return db.prepare('SELECT * FROM assets WHERE property_id = ?').all(property_id);
    }
  };
}

function manageFacilities(db) {
  return {
    updateStatus: (facility_id, status) => {
      return db.prepare('UPDATE facilities SET status = ? WHERE id = ?').run(status, facility_id);
    },
    listByProperty: (property_id) => {
      return db.prepare('SELECT * FROM facilities WHERE property_id = ?').all(property_id);
    }
  };
}

function tenantCommunication(tenant_id, message) {
  // Mock communication logic
  console.log(`Sending message to tenant ${tenant_id}: ${message}`);
  return { sent: true, timestamp: new Date().toISOString() };
}

module.exports = { manageLeases, manageUnits, manageAssets, manageFacilities, tenantCommunication };
