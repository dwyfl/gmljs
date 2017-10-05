import GMLUtil from '../util';
import GMLNode from './node';

export default class GMLEnvironment extends GMLNode {
  constructor() {
    super();
    this.supportedChildNodes = {
      'offset': {
        parser: function(node){ this.offset = GMLUtil.getPointFromNode(node); }
      },
      'rotation': {
        parser: function(node){ this.rotation = GMLUtil.getPointFromNode(node); }
      },
      'up': {
        parser: function(node){
          var v = GMLUtil.getPointFromNode(node);
          if (v.x || v.y || v.z) {
            this.up = v;
          }
        }
      },
      'screenbounds': {
        parser: function(node){ this.screenBounds = GMLUtil.getPointFromNode(node); }
      },
      'origin': {
        parser: function(node){ this.origin = GMLUtil.getPointFromNode(node); }
      },
      'realscale': {
        parser: function(node){ this.realScale = GMLUtil.getPointFromNode(node); }
      },
      'audio': {
        parser: function(node){ this.audio = node.textContent; }
      },
      'background': {
        parser: function(node){ this.background = node.textContent; }
      }
    };
  }
  getTagName() {
    return 'environment';
  }
  getChildrenAttributeNames() {
    return [
      'offset',
      'rotation',
      'up',
      'screenBounds',
      'origin',
      'realScale',
      'audio',
      'background'
    ];
  }
  toObject() {
    var obj = {};
    var childrenAttributes = this.getChildrenAttributeNames();
    for (var i = 0; i < childrenAttributes.length; ++i){
      if (this.hasOwnProperty(childrenAttributes[i])){
        obj[childrenAttributes[i]] = this[childrenAttributes[i]];
      }
    }
    return obj;
  }
  toString() {
    return GMLUtil.objectToXml(this.toObject(), this.getTagName());
  }
}