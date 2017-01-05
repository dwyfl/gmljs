import GMLNode from './node';
import GMLStroke from './stroke';

export default class GMLDrawing extends GMLNode {
	constructor() {
		super();
		this.stroke = [];
		this.supportedChildNodes = {
			'stroke': {
				required: true,
				model: GMLStroke,
				parser: function(node){
					this.stroke.push(GMLNode.create(GMLStroke, node));
				}
			}
		};
	}
	getTagName() {
		return 'drawing';
	}
	getChildren() {
		return this.stroke;
	}
}