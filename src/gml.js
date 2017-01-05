import {DOMParser} from 'xmldom';
import GMLUtil from './util';
import GMLNode from './nodes/node';
import GMLStroke from './nodes/stroke';
import GMLDocument from './nodes/document';

export default class GML {
	constructor(str) {
		this.doc = null;
		if (typeof(str) === 'string') {
			this.init(str);
		}
	}
	init(str) {
		var xmlDoc = this.parseXml(str);
		this.doc = new GMLDocument();
		this.doc.init(xmlDoc);
	}
	parseXml(str) {
		var parser = new DOMParser();
		return parser.parseFromString(str, "text/xml");
	}
	getTitle() {
		return this.doc ? this.doc.getChildPath(['gml','tag','0','header','client','username']) : null;
	}
	getClient() {
		return this.doc ? this.doc.getChildPath(['gml','tag','0','header','client']) : null;
	}
	getTags(tag) {
		var tags = this.doc ? this.doc.getChildPath(['gml','tag']) : null;
		if (typeof(tag) == 'undefined')
			return tags;
		if (tags && tags.length && tag >= 0 && tag < tags.length)
			return tags[tag];
		return null;
	}
	toString() {
		if (this.doc)
			return this.doc.toString();
		return '';
	}
	static createFromPointArrays(strokes) {
		var gml = new GML();
		var gmlStrokes = [];
		var gmlStroke;
		gml.doc = GMLNode.createDefault(GMLDocument);
		if (strokes && strokes.length) {
			for (var i = 0; i < strokes.length; i++) {
				gmlStroke = GMLNode.createDefault(GMLStroke);
				gmlStroke.pt = strokes[i];
				gmlStrokes.push(gmlStroke);
			}
			gml.doc.gml.tag[0].drawing[0].stroke = gmlStrokes;
		}
		return gml;
	}
}