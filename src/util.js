const GMLUtil = {};

export default GMLUtil;

GMLUtil.getObjectProperty = function(obj, prop){
	if (!obj || !prop)
		return null;
	var o = obj;
	for (var i = 0; i < prop.length; ++i){
		if (o && o.hasOwnProperty(prop[i])) {
			o = o[prop[i]];
		} else {
			return null;
		}
	}
	return o;
};
GMLUtil.getRealChildNodes = function(node){
	var result = [];
	for (var i = 0; node.childNodes && i < node.childNodes.length; ++i) {
		if (node.childNodes[i].nodeType == Node.ELEMENT_NODE) {
			result.push(node.childNodes[i]);
		}
	}
	return result;
};
GMLUtil.childNodesToObject = function(node, nodeNames){
	var result = {};
	var childNodes = GMLUtil.getRealChildNodes(node);
	for (var i = 0; i < childNodes.length; ++i) {
		var currentNode = childNodes[i];
		if (!nodeNames || nodeNames.indexOf(currentNode.nodeName) > -1) {
			var currentChildNodes = GMLUtil.getRealChildNodes(currentNode);
			result[currentNode.nodeName] = currentChildNodes.length ?
				GMLUtil.childNodesToObject(currentNode) : currentNode;
		}
	}
	return result;
};
GMLUtil.childNodeValuesToObject = function(node, nodeNames){
	var result = {};
	var obj = node instanceof Element ? GMLUtil.childNodesToObject(node) : node;
	for (var i in obj) {
		if (obj[i] instanceof Element)
			result[i] = obj[i].textContent;
		else
			result[i] = GMLUtil.childNodeValuesToObject(obj[i]);
	}
	return result;
};
GMLUtil.getColorFromNode = function(node){
	var color = {};
	var children = GMLUtil.childNodeValuesToObject(node);
	if (!children.hasOwnProperty('r') ||
		!children.hasOwnProperty('g') ||
		!children.hasOwnProperty('b'))
		throw Error('Node is not a valid Color.');
	color = GMLUtil.extend(color, children, ['r','g','b','a']);
	color = GMLUtil.convertAttrsToFloats(color, ['r','g','b','a']);
	return color;
};
GMLUtil.getPointFromNode = function(node){
	var point = {x:0,y:0};
	var children = GMLUtil.childNodeValuesToObject(node);
	point = GMLUtil.extend(point, children, ['x','y','z','t','time','pres','rot']);
	point = GMLUtil.convertAttrsToFloats(point, ['x','y','z','t','time','pres','rot']);
	if (point.hasOwnProperty('time')){
		if (!point.hasOwnProperty('t'))
			point.t = point.time;
		delete point.time;
	}
	if (children.hasOwnProperty('unit')) {
		point.unit = children.unit;
	}
	if (children.hasOwnProperty('dir')) {
		var dirNode = GMLUtil.childNodesToObject(node, ['dir']);
		var dirChildren = GMLUtil.childNodeValuesToObject(dirNode.dir, ['x','y','z']);
		point.dir = {x:0,y:0};
		point.dir = GMLUtil.extend(point.dir, dirChildren, ['x','y','z']);
		point.dir = GMLUtil.convertAttrsToFloats(point.dir, ['x','y','z']);
	}
	return point;
};
GMLUtil.extend = function(obj1, obj2, props){
	for (var i = 0; i < props.length; ++i){
		if (obj2.hasOwnProperty(props[i])){
			obj1[props[i]] = obj2[props[i]];
		}
	}
	return obj1;
};
GMLUtil.convertAttrsToFloats = function(obj, props){
	for (var i = 0; i < props.length; ++i){
		if (obj.hasOwnProperty(props[i])){
			var f = parseFloat(obj[props[i]]);
			obj[props[i]] = isNaN(f) ? 0.0 : f;
		}
	}
	return obj;
};
GMLUtil.formatXmlTagStart = function(nodeName, attributes){
	var tagString = '<'+nodeName;
	var attrStrings = [];
	if (attributes){
		for (var i in attributes){
			attrStrings.push(i+'="'+attributes[i]+'"');
		}
	}
	if (attrStrings.length)
		tagString += ' '+attrStrings.join(' ');
	return tagString+'>';
};
GMLUtil.formatXmlTagEnd = function(nodeName){
	return '</'+nodeName+'>';
};
GMLUtil.objectToXml = function(obj, objName){
	var result = GMLUtil.formatXmlTagStart(objName);
	for (var i in obj){
		if (obj.hasOwnProperty(i)) {
			if (obj[i] !== null && typeof(obj[i]) === 'object') {
				result += GMLUtil.objectToXml(obj[i], i);
			} else {
				result += GMLUtil.formatXmlTagStart(i);
				result += obj[i];
				result += GMLUtil.formatXmlTagEnd(i);
			}
		}
	}
	result += GMLUtil.formatXmlTagEnd(objName);
	return result;
};