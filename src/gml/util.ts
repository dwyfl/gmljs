export const formatXmlTagStart = (name: string, attributes: object = {}) => {
  const attrs: string[] = Object.keys(attributes).map(key => `${key}="${(<any>attributes)[key]}"`);
  return `<${name}${attrs.length ? ` ${attrs.join(' ')}` : ''}>`;
};

export const formatXmlTagEnd = (name: string) => `</${name}>`;

export const objectToXml = (obj: object, tagName: string): string =>
  (tagName !== undefined ? formatXmlTagStart(tagName) : '') +
  Object.keys(obj).reduce((result, key) => {
    if (typeof (<any>obj)[key] === 'object') {
      return result + objectToXml((<any>obj)[key], key);
    }
    return `${formatXmlTagStart(key)}${(<any>obj)[key]}${formatXmlTagEnd(key)}`;
  }, '') +
  (tagName !== undefined ? formatXmlTagEnd(tagName) : '');

// export const createFromModel = (model: Function, ...args) => new (<Function>model)(...args);

// static createNodeFromXml(nodeType, xmlStr) {
//   const xmlDocument = this.parseXml(xmlStr);
//   return nodeType.create(xmlDocument.documentElement);
// }