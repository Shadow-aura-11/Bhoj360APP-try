// Billing and Rent Collection for Property Management System (PMS)

function generateRentInvoice(db, lease_id) {
  const lease = db.prepare('SELECT * FROM leases WHERE id = ?').get(lease_id);
  if (!lease) throw new Error('Lease not found');

  const dueDate = new Date();
  dueDate.setMonth(dueDate.getMonth() + 1);
  dueDate.setDate(5); // Rent due on the 5th of next month

  const stmt = db.prepare('INSERT INTO rent_invoices (lease_id, amount, due_date, status) VALUES (?, ?, ?, ?)');
  return stmt.run(lease_id, lease.rent_amount, dueDate.toISOString().split('T')[0], 'Unpaid');
}

function processRentPayment(db, invoice_id, amount, method, txnId) {
  const invoice = db.prepare('SELECT * FROM rent_invoices WHERE id = ?').get(invoice_id);
  if (!invoice) throw new Error('Invoice not found');

  const dbTransaction = db.transaction(() => {
    // Record payment
    db.prepare('INSERT INTO payments (invoice_id, amount, payment_method, transaction_id) VALUES (?, ?, ?, ?)')
      .run(invoice_id, amount, method, txnId);

    // Update invoice status if fully paid
    if (amount >= invoice.amount) {
      db.prepare("UPDATE rent_invoices SET status = 'Paid' WHERE id = ?").run(invoice_id);
    } else {
      db.prepare("UPDATE rent_invoices SET status = 'Partially Paid' WHERE id = ?").run(invoice_id);
    }
  });

  dbTransaction();
  return { success: true };
}

module.exports = { generateRentInvoice, processRentPayment };
