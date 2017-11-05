import GML from '../../src';
import example000 from './data/example000.xml';
import example001 from './data/example001.xml';

it('creates an empty GML document', () => {
  const gml = new GML().toString();
  expect(gml).toMatchSnapshot();
});

it('parses a minimal GML document correctly', () => {
  const gml = new GML(example000).toString();
  expect(gml).toMatchSnapshot();
});

it('parses a basic GML document correctly', () => {
  const gml = new GML(example001).toString();
  expect(gml).toMatchSnapshot();
});

it('getTags() works', () => {
  const items = new GML(example001).getTags();
  expect(Array.isArray(items)).toBe(true);
  expect(items.length).toBe(1);
  expect(items[0].toString()).toMatchSnapshot();
});

it('getDrawings() works', () => {
  const items = new GML(example001).getDrawings(0);
  expect(Array.isArray(items)).toBe(true);
  expect(items.length).toBe(1);
  expect(items[0].toString()).toMatchSnapshot();
});

it('getStrokes() works', () => {
  const items = new GML(example001).getStrokes(0, 0);
  expect(Array.isArray(items)).toBe(true);
  expect(items.length).toBe(1);
  expect(items[0].toString()).toMatchSnapshot();
});

it('getPoints() works', () => {
  const items = new GML(example001).getPoints(0, 0, 0);
  expect(Array.isArray(items)).toBe(true);
  expect(items.length).toBe(155);
  expect(items.map(item => item.toString()).join('')).toMatchSnapshot();
});

it('GMLNode::getChildPath() works', () => {
  const name = new GML(example001).getRoot().getChildPath(['tag','header','client','name']);
  expect(name.toString()).toMatchSnapshot();
});