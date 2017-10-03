import GMLUtil from '../util';
import GMLNode from './node';
import GMLEnvironment from './environment';

export default class GMLHeader extends GMLNode {
	constructor() {
		super();
		this.client = null;
		this.environment = null;
		this.supportedChildNodes = {
			'client': {
				parser: function(node){
					this.client = GMLUtil.childNodeValuesToObject(node);
				}
			},
			'environment': {
				parser: function(node){
					this.environment = GMLNode.create(GMLEnvironment, node);
				}
			}
		};
	}
	getTagName() {
		return 'header';
	}
	getTagContent() {
		var result = '';
		if (this.client) {
			result += GMLUtil.objectToXml(this.client, 'client');
		}
		if (this.environment) {
			result += this.environment.toString();
		}
		return result;
	}
	initDefault() {
		super.initDefault();
		this.client = {
			name: 'GML.js',
			version: 1.0,
			time: Math.floor(Date.now() * 0.001)
		};
		this.environment = {
			up: {
				x: 0.0,
				y: -1.0,
				z: 0.0
			},
			screenBounds: {
				x: 1920,
				y: 1080,
				z: 0
			}
		};
	}
}