/**
 * TMS Business Logic Functions
 */

/**
 * Validates a travel request against the corporate policy.
 * @param {Object} db - The better-sqlite3 database instance.
 * @param {Object} request - The travel request object.
 * @param {Object} employee - The employee object.
 * @returns {Object} - { isCompliant, violations }
 */
function validatePolicyCompliance(db, request, employee) {
  const policy = db.prepare('SELECT * FROM policies WHERE id = ?').get(employee.policy_id);
  const violations = [];

  if (!policy) return { isCompliant: true, violations: [] };

  // Check trip duration
  const start = new Date(request.start_date);
  const end = new Date(request.end_date);
  const durationDays = (end - start) / (1000 * 60 * 60 * 24);

  if (durationDays > 30) {
    violations.push('Trip duration exceeds maximum allowed (30 days).');
  }

  // Check destination (example: restricted countries)
  const restrictedDestinations = ['Restricted Land', 'No Go Zone'];
  if (restrictedDestinations.includes(request.destination)) {
    violations.push(`Destination ${request.destination} requires special security clearance.`);
  }

  return {
    isCompliant: violations.length === 0,
    violations
  };
}

/**
 * Checks an expense for potential fraud.
 * @param {Object} expense - The expense object.
 * @returns {Object} - { fraudScore, fraudNotes }
 */
function detectExpenseFraud(expense) {
  let fraudScore = 0.05; // Base score
  let fraudNotes = 'Normal pattern';

  // Rule 1: High amount for meals
  if (expense.category === 'meals' && expense.amount > 200) {
    fraudScore += 0.4;
    fraudNotes = 'Meal expense exceeds typical limits.';
  }

  // Rule 2: Round numbers (often a sign of manual estimation)
  if (expense.amount > 0 && expense.amount % 50 === 0) {
    fraudScore += 0.2;
    fraudNotes += ' Exact round amount detected.';
  }

  // Rule 3: Future dated expenses
  if (new Date(expense.expense_date) > new Date()) {
    fraudScore = 1.0;
    fraudNotes = 'Future-dated expense detected. High risk.';
  }

  return {
    fraudScore: Math.min(fraudScore, 1.0),
    fraudNotes
  };
}

/**
 * Optimizes travel cost by recommending alternatives.
 * (Simulation)
 */
function getTravelCostOptimization(request) {
  return {
    recommendation: 'Booking 14 days in advance could save 20% on flight costs.',
    alternativeDestinations: [],
    estimatedSavings: '150.00 USD'
  };
}

module.exports = {
  validatePolicyCompliance,
  detectExpenseFraud,
  getTravelCostOptimization
};
