import { GMLNode } from '../..';
import { GMLNodeDefinition, GMLNodeName } from '../../types';
import { GMLStroke } from '../stroke';

export class GMLDrawing extends GMLNode {
  getStroke(index: number) {
    return this.getChildPath<GMLStroke>([[GMLNodeName.STROKE, index]]);
  }
  getStrokes(): GMLStroke[] {
    return this.getChildren<GMLStroke>(GMLNodeName.STROKE) ?? [];
  }
}

const definition: GMLNodeDefinition = {
  name: GMLNodeName.DRAWING,
  model: GMLDrawing,
  attributes: [],
  children: [
    GMLNodeName.STROKE,
  ],
};

export default definition;
