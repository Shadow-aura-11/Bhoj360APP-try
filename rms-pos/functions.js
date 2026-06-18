/**
 * RMS-POS Business Logic Functions
 * This file contains the retail-specific operations for the tenant microservice.
 */

// ─── Inventory & Product Logic ──────────────────────────────

/**
 * Adjusts stock for a product in a specific store.
 */
function adjustStock(db, productId, storeId, quantityChange, type, notes = '') {
  const inventory = db.prepare('SELECT id, quantity FROM inventory WHERE product_id = ? AND store_id = ?')
    .get(productId, storeId);

  if (!inventory) {
    // Initialize inventory if not exists
    db.prepare('INSERT INTO inventory (product_id, store_id, quantity) VALUES (?, ?, ?)')
      .run(productId, storeId, quantityChange);
  } else {
    const newQuantity = inventory.quantity + quantityChange;
    db.prepare('UPDATE inventory SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(newQuantity, inventory.id);
  }

  // Log to ledger or a separate inventory_logs table if we had one (we can use ledger for now)
  db.prepare('INSERT INTO ledger (type, category, amount, notes) VALUES (?, ?, ?, ?)')
    .run(quantityChange > 0 ? 'income' : 'expense', 'inventory_adjustment', Math.abs(quantityChange), `Product ID: ${productId}, Change: ${quantityChange}, Type: ${type}, Notes: ${notes}`);
}

/**
 * Handles Goods Received Note (GRN) - Restocking from Supplier
 */
function receivePurchaseOrder(db, purchaseId) {
  const purchase = db.prepare('SELECT * FROM purchases WHERE id = ?').get(purchaseId);
  if (!purchase || purchase.status === 'received') return false;

  const items = db.prepare('SELECT * FROM purchase_items WHERE purchase_id = ?').all(purchaseId);

  const transaction = db.transaction(() => {
    for (const item of items) {
      adjustStock(db, item.product_id, purchase.store_id, item.quantity, 'restock', `PO #${purchaseId}`);
    }
    db.prepare("UPDATE purchases SET status = 'received', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(purchaseId);

    // Add to accounting ledger as an expense
    db.prepare('INSERT INTO ledger (type, category, amount, reference_id, notes) VALUES (?, ?, ?, ?, ?)')
      .run('expense', 'purchase', purchase.total_amount, purchaseId, `Stock received from Supplier ID: ${purchase.supplier_id}`);
  });

  transaction();
  return true;
}

/**
 * Search products by barcode or name
 */
function searchProducts(db, query) {
  return db.prepare(`
    SELECT * FROM products
    WHERE (barcode = ? OR sku = ? OR name LIKE ?)
    AND is_active = 1
  `).all(query, query, `%${query}%`);
}

// ─── POS & Sales Logic ──────────────────────────────────────

/**
 * Process a retail sale
 */
function processSale(db, saleData) {
  const { store_id, customer_id, items, payment_method, cash_received } = saleData;

  let subtotal = 0;
  let totalTax = 0;
  let totalDiscount = 0;

  const processedItems = items.map(item => {
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(item.product_id);
    if (!product) throw new Error(`Product ${item.product_id} not found`);

    const itemSubtotal = product.sale_price * item.quantity;
    const itemTax = (itemSubtotal * product.tax_rate) / 100;

    // Check for product-specific promotions
    let itemDiscount = 0;
    const promo = db.prepare(`
      SELECT * FROM promotions
      WHERE active = 1
      AND (datetime('now') BETWEEN start_date AND end_date)
      AND (type = 'percentage' OR type = 'flat')
      ORDER BY value DESC LIMIT 1
    `).get(); // Simplified: just get the best active promo for now

    if (promo) {
      if (promo.type === 'percentage') {
        itemDiscount = (itemSubtotal * promo.value) / 100;
      } else if (promo.type === 'flat' && itemSubtotal >= promo.min_purchase_amount) {
        itemDiscount = promo.value;
      }
    }

    subtotal += itemSubtotal;
    totalTax += itemTax;
    totalDiscount += itemDiscount;

    return {
      ...item,
      unit_price: product.sale_price,
      tax_amount: itemTax,
      discount_amount: itemDiscount
    };
  });

  const finalAmount = subtotal + totalTax - totalDiscount;
  const changeGiven = payment_method === 'cash' ? Math.max(0, cash_received - finalAmount) : 0;

  const result = db.transaction(() => {
    // 1. Create Sale Record
    const saleInsert = db.prepare(`
      INSERT INTO sales (store_id, customer_id, total_amount, discount_amount, tax_amount, final_amount, payment_method, cash_received, change_given)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(store_id, customer_id || null, subtotal, totalDiscount, totalTax, finalAmount, payment_method, cash_received || 0, changeGiven);

    const saleId = saleInsert.lastInsertRowid;

    // 2. Add Sale Items & Update Inventory
    const itemStmt = db.prepare(`
      INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, discount_amount, tax_amount)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    for (const item of processedItems) {
      itemStmt.run(saleId, item.product_id, item.quantity, item.unit_price, item.discount_amount, item.tax_amount);
      adjustStock(db, item.product_id, store_id, -item.quantity, 'sale', `Sale #${saleId}`);
    }

    // 3. Update Loyalty Points
    if (customer_id) {
      const pointsEarned = Math.floor(finalAmount / 10); // 1 point per 10 currency units
      db.prepare('UPDATE customers SET loyalty_points = loyalty_points + ? WHERE id = ?')
        .run(pointsEarned, customer_id);
    }

    // 4. Add to Accounting Ledger
    db.prepare('INSERT INTO ledger (type, category, amount, reference_id, notes) VALUES (?, ?, ?, ?, ?)')
      .run('income', 'sales', finalAmount, saleId, `POS Sale #${saleId}`);

    return saleId;
  })();

  return { saleId: result, finalAmount, changeGiven };
}

/**
 * Processes a product return
 */
function processReturn(db, saleId, productId, quantity, reason) {
  const saleItem = db.prepare('SELECT * FROM sale_items WHERE sale_id = ? AND product_id = ?').get(saleId, productId);
  if (!saleItem || saleItem.quantity < quantity) throw new Error('Invalid return quantity');

  const sale = db.prepare('SELECT * FROM sales WHERE id = ?').get(saleId);
  const refundAmount = (saleItem.unit_price * quantity) + (saleItem.tax_amount / saleItem.quantity * quantity) - (saleItem.discount_amount / saleItem.quantity * quantity);

  db.transaction(() => {
    db.prepare('INSERT INTO returns (sale_id, reason, refund_amount, refund_method) VALUES (?, ?, ?, ?)')
      .run(saleId, reason, refundAmount, sale.payment_method);

    adjustStock(db, productId, sale.store_id, quantity, 'return', `Return for Sale #${saleId}`);

    db.prepare('INSERT INTO ledger (type, category, amount, reference_id, notes) VALUES (?, ?, ?, ?, ?)')
      .run('expense', 'return', refundAmount, saleId, `Return for Product ID: ${productId}`);
  })();

  return { refundAmount };
}

/**
 * Syncs with an external E-commerce platform (Simulation)
 */
function syncEcommerce(db, platform) {
  console.log(`[E-commerce] Syncing with ${platform}...`);
  // Simulation: Update products with online sales counts
  const result = db.prepare('UPDATE products SET description = description || " (Trending Online)" WHERE is_active = 1').run();
  return { synced_products: result.changes, platform };
}

// ─── AI Features (Simulation Logic) ─────────────────────────────

/**
 * Predicts demand for a product (AI Simulation)
 */
function forecastDemand(db, productId) {
  const historicalSales = db.prepare(`
    SELECT SUM(quantity) as total, strftime('%Y-%m', created_at) as month
    FROM sale_items
    JOIN sales ON sales.id = sale_items.sale_id
    WHERE product_id = ?
    GROUP BY month
    ORDER BY month DESC
    LIMIT 6
  `).all(productId);

  // Simple moving average simulation
  if (historicalSales.length === 0) return 0;
  const sum = historicalSales.reduce((acc, curr) => acc + curr.total, 0);
  const prediction = Math.ceil(sum / historicalSales.length * 1.15); // Add 15% growth factor

  db.prepare('INSERT INTO ai_insights (type, target_type, target_id, insight_data) VALUES (?, ?, ?, ?)')
    .run('demand_forecast', 'product', productId, JSON.stringify({ prediction, base_data: historicalSales }));

  return prediction;
}

/**
 * Optimizes prices based on demand (AI Simulation)
 */
function optimizePrices(db) {
  const products = db.prepare('SELECT id, sale_price FROM products WHERE is_active = 1').all();
  let updates = 0;

  db.transaction(() => {
    for (const product of products) {
      const forecast = forecastDemand(db, product.id);
      if (forecast > 10) { // High demand
        const newPrice = Math.round(product.sale_price * 1.05); // 5% increase
        db.prepare('UPDATE products SET sale_price = ? WHERE id = ?').run(newPrice, product.id);
        db.prepare('INSERT INTO ai_insights (type, target_type, target_id, insight_data) VALUES (?, ?, ?, ?)')
          .run('price_optimization', 'product', product.id, JSON.stringify({ old_price: product.sale_price, new_price: newPrice }));
        updates++;
      }
    }
  })();

  return { optimized_count: updates };
}

/**
 * Segments customers (AI Simulation)
 */
function segmentCustomers(db) {
  const customers = db.prepare('SELECT id, loyalty_points FROM customers').all();
  let segmentsUpdated = 0;

  db.transaction(() => {
    for (const customer of customers) {
      let segment = 'Regular';
      if (customer.loyalty_points > 500) segment = 'VIP';
      else if (customer.loyalty_points < 50) segment = 'Churn-risk';

      db.prepare('UPDATE customers SET segment = ? WHERE id = ?').run(segment, customer.id);
      db.prepare('INSERT INTO ai_insights (type, target_type, target_id, insight_data) VALUES (?, ?, ?, ?)')
        .run('customer_segmentation', 'customer', customer.id, JSON.stringify({ segment }));
      segmentsUpdated++;
    }
  })();

  return { total_segmented: segmentsUpdated };
}

module.exports = {
  adjustStock,
  receivePurchaseOrder,
  searchProducts,
  processSale,
  processReturn,
  syncEcommerce,
  forecastDemand,
  optimizePrices,
  segmentCustomers
};
