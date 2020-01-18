"use strict";
exports.__esModule = true;
exports.formatXmlTagStart = function (name, attributes) {
    if (attributes === void 0) { attributes = {}; }
    var attrs = Object.keys(attributes).map(function (key) { return key + "=\"" + attributes[key] + "\""; });
    return "<" + name + (attrs.length ? " " + attrs.join(' ') : '') + ">";
};
exports.formatXmlTagEnd = function (name) { return "</" + name + ">"; };
exports.objectToXml = function (obj, tagName) {
    return (tagName !== undefined ? exports.formatXmlTagStart(tagName) : '') +
        Object.keys(obj).reduce(function (result, key) {
            if (typeof obj[key] === 'object') {
                return result + exports.objectToXml(obj[key], key);
            }
            return "" + exports.formatXmlTagStart(key) + obj[key] + exports.formatXmlTagEnd(key);
        }, '') +
        (tagName !== undefined ? exports.formatXmlTagEnd(tagName) : '');
};
// export const createFromModel = (model: Function, ...args) => new (<Function>model)(...args);
// static createNodeFromXml(nodeType, xmlStr) {
//   const xmlDocument = this.parseXml(xmlStr);
//   return nodeType.create(xmlDocument.documentElement);
// }
