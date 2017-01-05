import GMLUtil from '../util';
import GMLNode from './node';
import GMLTag from './tag';

export default class GMLRoot extends GMLNode {
	constructor() {
		super();
		this.tag = [];
		this.spec = null;
		this.supportedChildNodes = {
			'tag': {
				required: true,
				model: GMLTag,
				parser: function(node){
					this.tag.push(GMLNode.create(GMLTag, node));
				}
			}
		};
		this.supportedAttributes = {
			'spec': {
				default: '1.0',
				parser: function(value){
					this.spec = value;
				}
			}
		};
	}
	getTagName() {
		return 'gml';
	}
	getChildren() {
		return this.tag;
	}
}