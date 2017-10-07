export const formatXmlTagStart = (nodeName, attributes) => {
  const attrStrings = [];
  if (attributes) {
    Object.keys(attributes).forEach(key => {
      attrStrings.push(`${key}="${attributes[key]}"`);
    });
  }
  return `<${nodeName}${attrStrings.length ? ' '+attrStrings.join(' ') : ''}>`;
};

export const formatXmlTagEnd = nodeName => {
  return '</'+nodeName+'>';
};

export const objectToXml = (obj, objName) => {
  var result = formatXmlTagStart(objName);
  Object.keys(obj).forEach(key => {
    if (obj[key] !== null && typeof(obj[key]) === 'object') {
      result += objectToXml(obj[key], key);
    } else {
      result += formatXmlTagStart(key);
      result += obj[key];
      result += formatXmlTagEnd(key);
    }
  });
  result += formatXmlTagEnd(objName);
  return result;
};
