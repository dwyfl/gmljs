import GMLClient from '../../src/node/client';

it('creates a correct default GMLClient node', () => {
  const gml = GMLClient.create().toString();
  expect(gml).toMatchSnapshot();
});