import settings from '../settings.json';

export function assert(condition, message) {
  if (settings.assert.print_errors) {
    // eslint-disable-next-line no-console
    console.assert(condition, message);
  }
  if (settings.assert.throw_errors && !condition) {
    throw new Error(message || 'Assertion failed');
  }
}

export default assert;

export function assertString(str, message) {
  assert(typeof str === 'string', message);
}

export function assertStringNotEmpty(str, message) {
  assert(typeof str === 'string' && str.length, message);
}

export function assertNumber(num, message) {
  assert(!isNaN(parseFloat(num)) && isFinite(num), message);
}
