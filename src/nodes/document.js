import GMLUtil from '../util';
import GMLNode from './node';
import GMLRoot from './root';

export default class GMLDocument extends GMLNode {
	constructor() {
		super();
		this.gml = null;
		this.supportedChildNodes = {
			'gml': {
				required: true,
				array: false,
				model: GMLRoot,
				parser: function(node){ this.gml = GMLNode.create(GMLRoot, node); }
			}
		};
	}
	getTagName() {
		throw new Error('GMLDocument is not a tag.');
	}
	toString() {
		return this.gml ? this.gml.toString() : '';
	}
}
