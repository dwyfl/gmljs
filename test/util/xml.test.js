import { formatXmlTagStart, formatXmlTagEnd } from '../../src/util/xml';

test('formatXmlTagStart()', () => {
  expect(formatXmlTagStart('test')).toBe('<test>');
});
test('formatXmlTagStart() with attributes', () => {
  expect(formatXmlTagStart('test', {keke: 'lele'})).toBe('<test keke="lele">');
});
test('formatXmlTagEnd()', () => {
  expect(formatXmlTagEnd('test')).toBe('</test>');
});