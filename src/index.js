import {DOMParser} from 'xmldom';
import GMLStroke from './node/stroke';
import GMLDocument from './node/document';

export default class GML {
  constructor(str) {
    if (typeof str === 'string') {
      this.init(str);
    }
    else {
      this.doc = GMLDocument.create();
    }
  }
  init(str) {
    this.doc = GMLDocument.create(GML.parseXml(str));
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
  static createFromPointArrays(strokes = []) {
    const gml = new GML();
    gml.doc = GMLDocument.create();
    const gmlDrawing = gml.doc.getChildPath(['gml', 'children', 'tag', 0, 'children', 'drawing', 0]);
    gmlDrawing.children.stroke = strokes.map(item => GMLStroke.createFromPointArray(item));
    return gml;
  }
  static createNodeFromXml(nodeType, xmlStr) {
    const xmlDocument = this.parseXml(xmlStr);
    return nodeType.create(xmlDocument.documentElement);
  }
  static parseXml(str) {
    var parser = new DOMParser();
    var doc = parser.parseFromString(str, 'application/xml');
    if (this.parserHadError(doc)) {
      throw new Error('Unable to parse GML!');
    }
    return doc;
  }
  static parserHadError(parsedDocument) {
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
}