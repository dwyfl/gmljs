import GMLUtil from '../util';
import GMLNode from './node';

export default class GMLBrush extends GMLNode {
	constructor() {
		super();
		this.supportedChildNodes = {
			'mode': {
				parser: function(node){ this.mode = node.textContent; }
			},
			'uniquestyleid': {
				parser: function(node){ this.uniqueStyleID = node.textContent; }
			},
			'spec': {
				parser: function(node){ this.spec = node.textContent; }
			},
			'width': {
				parser: function(node){ this.width = parseFloat(node.textContent); }
			},
			'speedtowidthratio': {
				parser: function(node){ this.speedToWidthRatio = parseFloat(node.textContent); }
			},
			'dripamnt': {
				parser: function(node){ this.dripAmnt = parseFloat(node.textContent); }
			},
			'dripspeed': {
				parser: function(node){ this.dripSpeed = parseFloat(node.textContent); }
			},
			'layerabsolute': {
				parser: function(node){ this.layerAbsolute = node.textContent; }
			},
			'layerrelative': {
				parser: function(node){ this.layerRelative = node.textContent; }
			},
			'color': {
				parser: function(node){ this.color = GMLUtil.getColorFromNode(node); }
			},
			'dripvecrelativetoup': {
				parser: function(node){ this.dripVecRelativeToUp = GMLUtil.getPointFromNode(node); }
			},
		};
	}
	getTagName() {
		return 'brush';
	}
	getChildrenAttributeNames() {
		return [
			'mode',
			'uniqueStyleID',
			'spec',
			'width',
			'speedToWidthRatio',
			'dripAmnt',
			'dripSpeed',
			'layerAbsolute',
			'layerRelative',
			'color',
			'dripVecRelativeToUp'
		];
	}
	getChildren() {
		var result = [];
		var children = this.toObject();
		for (var i in children) {
			result.push(children[i]);
		}
		return result;
	}
	toObject() {
		var obj = {};
		var childrenAttributes = this.getChildrenAttributeNames();
		for (var i = 0; i < childrenAttributes.length; ++i){
			if (this.hasOwnProperty(childrenAttributes[i])){
				obj[childrenAttributes[i].toLowerCase()] = this[childrenAttributes[i]];
			}
		}
		return obj;
	}
	toString() {
		return GMLUtil.objectToXml(this.toObject(), this.getTagName());
	}
}