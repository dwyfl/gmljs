
// GENERAL

export const getObjectProperty = (obj, prop) => {
  if (!obj || !prop) {
    return null;
  }
  let o = obj;
  for (let i = 0; i < prop.length; ++i){
    if (o && o.hasOwnProperty(prop[i])) {
      o = o[prop[i]];
    } else {
      return null;
    }
  }
  return o;
};

export const hasOwnProperties = (obj, props) => {
  return props.every(obj.hasOwnProperty);
};

export const filterProps = (obj, props) => {
  const result = {};
  props.forEach(prop => {
    if (obj.hasOwnProperty(prop)) {
      result[prop] = obj[prop];
    }
  });
  return result;
};

export const convertPropsToFloats = (obj, props) => {
  (props === undefined ? Object.keys(obj) : props).forEach(prop => {
    if (obj.hasOwnProperty(prop)){
      const f = parseFloat(obj[prop]);
      obj[prop] = isNaN(f) ? 0.0 : f;
    }
  });
  return obj;
};

// NODES

const POINT_DEFAULT = {x: 0.0, y: 0.0};
const POINT_PROPS_REQ = ['x', 'y'];
const POINT_PROPS_ALL = ['x', 'y', 'z', 't', 'time', 'pres', 'rot']; // floats props only

const COLOR_DEFAULT = {r: 0.0, g: 0.0, b: 0.0};
const COLOR_PROPS_REQ = ['r', 'g', 'b'];
const COLOR_PROPS_ALL = ['r', 'g', 'b', 'a'];

export const isElement = node => {
  return node.constructor.name === 'Element';
};

export const getRealChildNodes = node => {
  return Array.isArray(node.childNodes)
    ? node.childNodes.filter(isElement)
    : [];
};

export const childNodesToObject = (node, nodeNames) => {
  const result = {};
  if (Array.isArray(node.childNodes)) {
    getRealChildNodes(node).forEach(currentNode => {
      if (nodeNames.indexOf(currentNode.nodeName) > -1) {
        const currentNodeChildren = getRealChildNodes(currentNode);
        result[currentNode.nodeName] = currentNodeChildren.length
          ? childNodesToObject(currentNode)
          : currentNode;
      }
    });
  }
  return result;
};

export const childNodeValuesToObject = node => {
  const obj = isElement(node)
    ? childNodesToObject(node)
    : node;
  const result = {};
  Object.keys(obj).forEach(key => {
    result[key] = isElement(obj[key])
      ? obj[key].textContent
      : childNodeValuesToObject(obj[key]);
  });
  return result;
};

export const getFloatsFromNode = (node, props, defaults) => {
  return convertPropsToFloats(
    Object.assign(
      defaults === undefined ? {} : defaults,
      filterProps(childNodeValuesToObject(node), props))
  );
};

export const getColorFromNode = node => {
  const values = childNodeValuesToObject(node);
  if (!hasOwnProperties(values, COLOR_PROPS_REQ)) {
    throw Error('Node is not a valid Color.');
  }
  return getFloatsFromNode(values, COLOR_PROPS_ALL, COLOR_DEFAULT);
};

export const getPointFromNode = node => {
  const values = childNodeValuesToObject(node);
  if (!hasOwnProperties(values, POINT_PROPS_REQ)) {
    throw Error('Node is not a valid Point.');
  }
  let result = getFloatsFromNode(values, POINT_PROPS_ALL, POINT_DEFAULT);
  if (result.hasOwnProperty('time')) {
    if (!result.hasOwnProperty('t')) {
      result.t = result.time;
    }
    delete result.time;
  }
  if (values.hasOwnProperty('unit')) {
    result.unit = values.unit;
  }
  if (values.hasOwnProperty('dir')) {
    result.dir = getFloatsFromNode(values.dir, ['x', 'y', 'z'], POINT_DEFAULT);
  }
  return result;
};

// XML STRINGS

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
