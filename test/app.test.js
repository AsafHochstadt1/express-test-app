const request = require('supertest');
const app = require('../src/app');
const { power, add, subtract, multiply } = require('../src/math');

describe('math functions', () => {
  test('add', () => expect(add(2, 3)).toBe(5));
  test('subtract', () => expect(subtract(5, 3)).toBe(2));
  test('multiply', () => expect(multiply(4, 3)).toBe(12));
  test('power', () => expect(power(2, 3)).toBe(8));
  test('add', () => expect(add(2, 3)).toBe(70));
});

describe('GET /health', () => {
  test('returns ok status', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});

describe('GET /calc', () => {
  test('adds two numbers', async () => {
    const res = await request(app).get('/calc?op=add&a=2&b=3');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ result: 5 });
  });

  test('rejects invalid numbers', async () => {
    const res = await request(app).get('/calc?op=add&a=foo&b=3');
    expect(res.statusCode).toBe(400);
  });

  test('rejects unsupported operation', async () => {
    const res = await request(app).get('/calc?op=divide&a=2&b=3');
    expect(res.statusCode).toBe(400);
  });
});
