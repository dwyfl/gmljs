import GML from "../../..";
import GMLTag from "..";
import test001 from "./data/test001.xml";
import test002 from "./data/test002.xml";
import test003 from "./data/test003.xml";
import test004 from "./data/test004.xml";

it("creates a correct default GMLBrush node", () => {
  const gml = GMLTag.create().toString();
  expect(gml).toMatchSnapshot();
});

it("creates a correct GMLTag node from spec XML", () => {
  const gmlNode = GML.createNodeFromXml(GMLTag, test001);
  const gmlString = gmlNode.toString();
  expect(gmlString).toMatchSnapshot();
});
