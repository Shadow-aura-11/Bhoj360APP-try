/**
 * Manufacturing ERP / MES Core Functions
 */

/**
 * Calculates the total cost of a product based on its BOM.
 * @param {Database} db
 * @param {number} productId
 * @returns {number}
 */
function calculateProductCost(db, productId) {
  const bomHeader = db.prepare('SELECT id FROM bom_headers WHERE product_id = ? AND is_active = 1').get(productId);
  if (!bomHeader) {
    const product = db.prepare('SELECT cost FROM products WHERE id = ?').get(productId);
    return product ? product.cost : 0;
  }

  const items = db.prepare('SELECT component_id, quantity FROM bom_items WHERE bom_header_id = ?').all(bomHeader.id);
  let totalCost = 0;
  for (const item of items) {
    totalCost += calculateProductCost(db, item.component_id) * item.quantity;
  }
  return totalCost;
}

/**
 * Runs MRP for a specific production order.
 * Calculates material shortages.
 * @param {Database} db
 * @param {number} productionOrderId
 * @returns {Array}
 */
function runMRPForOrder(db, productionOrderId) {
  const order = db.prepare('SELECT product_id, quantity FROM production_orders WHERE id = ?').get(productionOrderId);
  if (!order) return [];

  const bomHeader = db.prepare('SELECT id FROM bom_headers WHERE product_id = ? AND is_active = 1').get(order.product_id);
  if (!bomHeader) return [];

  const components = db.prepare('SELECT component_id, quantity FROM bom_items WHERE bom_header_id = ?').all(bomHeader.id);
  const shortages = [];

  for (const comp of components) {
    const requiredQty = comp.quantity * order.quantity;
    const inventory = db.prepare('SELECT SUM(quantity) as total FROM inventory_items WHERE product_id = ?').get(comp.component_id);
    const availableQty = inventory.total || 0;

    if (availableQty < requiredQty) {
      shortages.push({
        product_id: comp.component_id,
        required: requiredQty,
        available: availableQty,
        shortage: requiredQty - availableQty
      });
    }
  }

  return shortages;
}

/**
 * Updates machine status and logs the change.
 * @param {Database} db
 * @param {number} machineId
 * @param {string} status
 * @param {string} notes
 */
function updateMachineStatus(db, machineId, status, notes = '') {
  db.prepare('UPDATE machines SET status = ? WHERE id = ?').run(status, machineId);
  db.prepare('INSERT INTO machine_logs (machine_id, status, notes) VALUES (?, ?, ?)').run(machineId, status, notes);
}

module.exports = {
  calculateProductCost,
  runMRPForOrder,
  updateMachineStatus
};
