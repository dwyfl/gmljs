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
