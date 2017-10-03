import GMLNode from './node';
import GMLHeader from './header';
import GMLEnvironment from './environment';
import GMLDrawing from './drawing';

export default class GMLTag extends GMLNode {
  constructor() {
    super();
    this.header = null;
    this.environment = null;
    this.drawing = [];
    this.supportedChildNodes = {
      'header': {
        model: GMLHeader,
        array: false,
        parser: function(node){
          this.header = GMLNode.create(GMLHeader, node);
        }
      },
      'environment': {
        parser: function(node){
          this.environment = GMLNode.create(GMLEnvironment, node);
        }
      },
      'drawing': {
        required: true,
        model: GMLDrawing,
        parser: function(node){
          this.drawing.push(GMLNode.create(GMLDrawing, node));
        }
      }
    };
  }
  getTagName() {
    return 'tag';
  }
  getChildren() {
    var result = [];
    if (this.header) {
      result.push(this.header);
    }
    if (this.environment) {
      result.push(this.environment);
    }
    return result.concat(this.drawing);
  }
  getEnvironment() {
    var env = null;
    if (this.environment)
      env = this.environment;
    else if (this.header && this.header.environment)
      env = this.header.environment;
    return env ? env.toObject() : null;
  }
}