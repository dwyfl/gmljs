import GML from '../../../src';
import GMLClient from '../../../src/node/client';
import testXml from './data/test.xml';

it('creates a correct default GMLClient node', () => {
  const _now = Date.now;
  Date.now = jest.fn(() => 0);
  try {
    const gml = GMLClient.create().toString();
    expect(gml).toMatchSnapshot();
  } finally {
    Date.now = _now;
  }
});

it('creates a correct GMLClient node from spec XML', () => {
  const gmlNode = GML.createNodeFromXml(GMLClient, testXml);
  const gml = gmlNode.toString();
  expect(gml).toMatchSnapshot();
});