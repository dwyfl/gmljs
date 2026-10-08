/** An element gmljs doesn't know, or doesn't allow at its position, kept verbatim. */
export class GMLUnknownNode {
  /** The tag name as written in the document. */
  readonly name: string;
  /** The element serialized as XML. */
  readonly xml: string;

  constructor(name: string, xml: string) {
    this.name = name;
    this.xml = xml;
  }

  toString(): string {
    return this.xml;
  }
}
