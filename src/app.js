const express = require('express');
const { add, subtract, multiply } = require('./math');

const app = express();

// Health check endpoint - handy for CI smoke tests and deploy checks.
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Simple calculator endpoint: /calc?op=add&a=2&b=3
app.get('/calc', (req, res) => {
  const { op, a, b } = req.query;
  const numA = Number(a);
  const numB = Number(b);

  if (Number.isNaN(numA) || Number.isNaN(numB)) {
    return res.status(400).json({ error: 'a and b must be numbers' });
  }

  const operations = {
    add: () => add(numA, numB),
    subtract: () => subtract(numA, numB),
    multiply: () => multiply(numA, numB),
    power: () => power(numA, numB),
  };

  if (!operations[op]) {
    return res.status(400).json({ error: `unsupported op: ${op}` });
  }

  return res.status(200).json({ result: operations[op]() });
});

// Only start the server if this file is run directly (not when required by tests).
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

module.exports = app;
