import { GMLNode } from '../..';
import { GMLNodeDefinition, GMLNodeName } from '../../types';

export class GMLHeader extends GMLNode {}

const definition: GMLNodeDefinition = {
  name: GMLNodeName.HEADER,
  model: GMLHeader,
  attributes: [],
  children: [
    GMLNodeName.CLIENT,
    GMLNodeName.ENVIRONMENT,
  ],
};

export default definition;
