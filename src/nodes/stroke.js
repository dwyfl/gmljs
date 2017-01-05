import GMLUtil from '../util';
import GMLNode from './node';
import GMLBrush from './brush';

export default class GMLStroke extends GMLNode {
	constructor() {
		super();
		this.isDrawing = true;
		this.info = null;
		this.brush = null;
		this.pt = [];
		this.supportedChildNodes = {
			'info': {
				parser: function(node){
					this.info = GMLUtil.childNodeValuesToObject(node);
				}
			},
			'brush': {
				parser: function(node){
					this.brush = GMLNode.create(GMLBrush, node);
				}
			},
			'pt': {
				required: true,
				default: [],
				parser: function(node){
					this.pt.push(GMLUtil.getPointFromNode(node));
				}
			}
		};
		this.supportedAttributes = {
			'isdrawing': {
				parser: function(value){
					value = typeof(value) == 'string' ? value != 'false' : !!value;
					this.isDrawing = value;
					this.attributes.isDrawing = value;
				}
			}
		};
	}
	getTagName() {
		return 'stroke';
	}
	getTagContent() {
		var result = '';
		if (this.info) {
			result += GMLUtil.objectToXml(this.info, 'info');
		}
		if (this.brush) {
			result += this.brush.toString();
		}
		for (var i = 0; this.pt && i < this.pt.length; ++i) {
			result += GMLUtil.objectToXml(this.pt[i], 'pt');
		}
		return result;
	}
}