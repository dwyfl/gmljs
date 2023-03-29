import { formatXmlTagStart, formatXmlTagEnd } from '../../src/util/xml';

test('formatXmlTagStart()', () => {
  expect(formatXmlTagStart('test')).toBe('<test>');
});
test('formatXmlTagStart() with attributes', () => {
  expect(formatXmlTagStart('test', { keke: 'lele' })).toBe('<test keke="lele">');
  expect(formatXmlTagStart('test', { keke: 'lele', asdf: 'qwer' })).toBe('<test keke="lele" asdf="qwer">');
});
test('formatXmlTagEnd()', () => {
  expect(formatXmlTagEnd('test')).toBe('</test>');
});