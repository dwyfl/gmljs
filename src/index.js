import {DOMParser} from 'xmldom';
import GMLNode from './nodes/node';
import GMLStroke from './nodes/stroke';
import GMLDocument from './nodes/document';

export default class GML {
  constructor(str) {
    this.doc = null;
    if (typeof(str) === 'string') {
      this.init(str);
    }
  }
  init(str) {
    var xmlDoc = this.parseXml(str);
    this.doc = new GMLDocument();
    this.doc.init(xmlDoc);
  }
  parseXml(str) {
    var parser = new DOMParser();
    var doc = parser.parseFromString(str, 'text/xml');
    if (this.parserHadError(doc)) {
      throw new Error('Unable to parse GML!');
    }
    return doc;
  }
  parserHadError(parsedDocument) {
    const parserError = parsedDocument.getElementsByTagName('parsererror');
    const parsererrorNS = parserError.length ? parserError[0].namespaceURI : null;
    if (parsererrorNS === 'http://www.w3.org/1999/xhtml') {
      // In PhantomJS the parseerror element doesn't seem to have a special namespace
      // Stolen from:
      // http://stackoverflow.com/questions/11563554/how-do-i-detect-xml-parsing-errors-when-using-javascripts-domparser-in-a-cross
      return parsedDocument.getElementsByTagName('parsererror').length > 0;
    }
    return parsedDocument.getElementsByTagNameNS(parsererrorNS, 'parsererror').length > 0;
  }
  getTitle() {
    return this.doc ? this.doc.getChildPath(['gml','tag','0','header','client','username']) : null;
  }
  getClient() {
    return this.doc ? this.doc.getChildPath(['gml','tag','0','header','client']) : null;
  }
  getTags(tag) {
    return this._getChildren(['gml', 'tag'], tag);
  }
  getDrawings(tag, drawing) {
    return this._getChildren(['gml', 'tag', tag], drawing);
  }
  getStrokes(tag, drawing, stroke) {
    return this._getChildren(['gml', 'tag', tag, 'drawing', drawing], stroke);
  }
  getPoints(tag, drawing, stroke, point) {
    return this._getChildren(['gml', 'tag', tag, 'drawing', drawing, 'stroke', stroke], point);
  }
  _getChildren(path, childIndex) {
    if (!this.doc) {
      return null;
    }
    let children = this.doc.getChildPath(path);
    if (typeof(childIndex) === 'undefined') {
      return children;
    }
    if (children && childIndex >= 0 && childIndex < children.length) {
      return children[childIndex];
    }
    return null;
  }
  toString() {
    return this.doc ? this.doc.toString() : '';
  }
  static createFromPointArrays(strokes) {
    var gml = new GML();
    var gmlStrokes = [];
    var gmlStroke;
    gml.doc = GMLNode.createDefault(GMLDocument);
    if (strokes && strokes.length) {
      for (var i = 0; i < strokes.length; i++) {
        gmlStroke = GMLNode.createDefault(GMLStroke);
        gmlStroke.pt = strokes[i];
        gmlStrokes.push(gmlStroke);
      }
      gml.doc.gml.tag[0].drawing[0].stroke = gmlStrokes;
    }
    return gml;
  }
}