import { DOMParser } from 'xmldom';

class GMLParser {
  static parseXml(xml: string): Document {
    var parser = new DOMParser();
    var doc = parser.parseFromString(xml, 'application/xml');
    if (this.parserHadError(doc)) {
      throw new Error('Unable to parse GML');
    }
    return doc;
  }
  static parserHadError(doc: Document): boolean {
    const parserError = doc.getElementsByTagName('parsererror');
    const parsererrorNS = parserError.length ? parserError[0].namespaceURI : null;
    if (parsererrorNS === 'http://www.w3.org/1999/xhtml') {
      // In PhantomJS the parseerror element doesn't seem to have a special namespace
      // Stolen from:
      // http://stackoverflow.com/questions/11563554/how-do-i-detect-xml-parsing-errors-when-using-javascripts-domparser-in-a-cross
      return doc.getElementsByTagName('parsererror').length > 0;
    }
    if (parsererrorNS !== null) {
      return doc.getElementsByTagNameNS(parsererrorNS, 'parsererror').length > 0;
    }
    return false;
  }
}

export default GMLParser;
