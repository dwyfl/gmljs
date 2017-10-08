import GML from '../src';
import gmlData from './data/example000.xml';

it('parses a minimal GML file correctly', () => {
  const gml = new GML(gmlData).toString();
  expect(gml).toMatchSnapshot();
});