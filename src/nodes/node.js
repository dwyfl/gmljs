import { getObjectProperty, formatXmlTagStart, formatXmlTagEnd } from '../util';

export default class GMLNode {
	constructor() {
		this.attributes = {};
		this.supportedChildNodes = {};
		this.supportedAttributes = {};
	}
	static create(type, node) {
		var obj = new type();
		obj.init(node);
		return obj;
	}
	static createDefault(type) {
		var obj = new type();
		obj.initDefault();
		return obj;
	}
	static parseChildNodes(node, context, nodeDefinitions) {
		if (!node)
			return;
		// TODO: Add required check
		// if (nodeDefinition.required && !nodeList.length)
		// 	throw Error('Required node not found: "'+nodeDefinition.name+'".');
		var currentNode = null;
		var nodeDefinition = null;
		var nodeName = null;
		for (var i = 0; node.childNodes && i < node.childNodes.length; ++i) {
			currentNode = node.childNodes[i];
			nodeName = currentNode.nodeName.toLowerCase();
			if (nodeDefinitions.hasOwnProperty(nodeName)) {
				nodeDefinition = nodeDefinitions[nodeName];
				if (nodeDefinition.hasOwnProperty('parser')) {
					nodeDefinition.parser.apply(context, [currentNode]);
				}
			}
		}
	}
	static parseAttributes(node, context, nodeDefinitions) {
		if (!node)
			return;
		// TODO: Add required check
		var nodeDefinition = null;
		var nodeName = null;
		var nodeValue = null;
		for (var i = 0; node.attributes && i < node.attributes.length; ++i) {
			nodeName = node.attributes.item(i).nodeName.toLowerCase();
			nodeValue = node.attributes.item(i).value;
			if (nodeDefinitions.hasOwnProperty(nodeName)) {
				nodeDefinition = nodeDefinitions[nodeName];
				if (nodeDefinition.hasOwnProperty('parser')) {
					nodeDefinition.parser.apply(context, [nodeValue]);
				}
				else {
					// By default just add to attributes object
					context.attributes[nodeName] = nodeValue;
				}
			}
		}
	}
	init(node) {
		this.preInit();
		GMLNode.parseChildNodes(node, this, this.supportedChildNodes);
		GMLNode.parseAttributes(node, this, this.supportedAttributes);
		this.postInit();
	}
	preInit() {
		// Do nothing
	}
	postInit() {
		// Do nothing
	}
	initDefault() {
		for (var i in this.supportedChildNodes) {
			if (this.supportedChildNodes[i].hasOwnProperty('model')) {
				this[i] = GMLNode.createDefault(this.supportedChildNodes[i].model);
				if (
					!this.supportedChildNodes[i].hasOwnProperty('array') ||
					this.supportedChildNodes[i].array
				) {
					this[i] = [this[i]];
				}
			}
			if (this.supportedChildNodes[i].hasOwnProperty('default')) {
				this[i] = this.supportedChildNodes[i].default;
			}
		}
		for (var i in this.supportedAttributes) {
			if (this.supportedAttributes[i].hasOwnProperty('default')) {
				this[i] = this.supportedAttributes[i].default;
			}
		}
	}
	getAttribute(key) {
		return this.attributes.hasOwnProperty(key) ? this.attributes[key] : null;
	}
	getChildPath(pathArray) {
		return getObjectProperty(this, pathArray);
	}
	getChildren() {
		return [];
	}
	toString() {
		return this.getTagStart() + this.getTagContent() + this.getTagEnd();
	}
	getTagStart() {
		return formatXmlTagStart(this.getTagName(), this.attributes);
	}
	getTagContent() {
		var result = '';
		var children = this.getChildren();
		for (var i = 0; i < children.length; ++i) {
			result += children[i].toString();
		}
		return result;
	}
	getTagEnd() {
		return formatXmlTagEnd(this.getTagName());
	}
	getTagName() {
		throw new Error('GMLNode::getTagName() needs to be overridden by subclass.');
	}
}