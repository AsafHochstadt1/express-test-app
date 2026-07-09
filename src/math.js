// Small pure functions so we have something meaningful to unit test.

function add(a, b) {
  return a + b;
}

function subtract(a, b) {
  return a - b;
}

function multiply(a, b) {
  return a * b;
}

function power(a, b) {
  return a ** b;
}

module.exports = { power, add, subtract, multiply };
