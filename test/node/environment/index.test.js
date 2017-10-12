import GML from '../../../src';
import GMLEnvironment from '../../../src/node/environment';
import testXml from './data/test.xml';

it('creates a correct default GMLEnvironment node', () => {
  const gml = GMLEnvironment.create().toString();
  expect(gml).toMatchSnapshot();
});

it('creates a correct GMLEnvironment node from spec XML', () => {
  const gmlNode = GML.createNodeFromXml(GMLEnvironment, testXml);
  const gml = gmlNode.toString();
  expect(gml).toMatchSnapshot();
});