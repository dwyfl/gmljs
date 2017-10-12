import GML from '../../../src';
import GMLBrush from '../../../src/node/brush';
import testXml from './data/test.xml';

it('creates a correct default GMLBrush node', () => {
  const gml = GMLBrush.create().toString();
  expect(gml).toMatchSnapshot();
});

it('creates a correct GMLBrush node from spec XML', () => {
  const gmlNode = GML.createNodeFromXml(GMLBrush, testXml);
  const gml = gmlNode.toString();
  expect(gml).toMatchSnapshot();
});