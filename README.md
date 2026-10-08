# gmljs

- It parses [GML (Graffiti Markup Language)](https://en.wikipedia.org/wiki/Graffiti_Markup_Language) documents.
- It's a JavaScript library with full TypeScript support, for Node.js and browsers.
- It's open source.

## Installation

```
npm install gmljs
```

## Example

```javascript
import { GML } from "gmljs";

// Init GML instance with string
const gmlDocumentStr = `
<gml spec='1.0'>
  <tag>
    <drawing>
      <stroke>
        <pt><x>0.0</x><y>0.0</y></pt>
        <pt><x>100.0</x><y>0.0</y></pt>
        <pt><x>100.0</x><y>100.0</y></pt>
        <pt><x>0.0</x><y>100.0</y></pt>
        <pt><x>0.0</x><y>0.0</y></pt>
      </stroke>
    </drawing>
  </tag>
</gml>
`;
const gml = new GML(gmlDocumentStr);

// Setup canvas
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Iterate over all strokes in the document
for (const stroke of gml.strokes()) {
  // Get points in stroke
  const [firstPoint, ...points] = stroke.getPoints();
  if (!firstPoint) continue;

  // Begin draw to canvas
  ctx.beginPath();
  const [x, y] = firstPoint.getXYZ();
  ctx.moveTo(x, y);

  for (const pt of points) {
    const [x, y] = pt.getXYZ();
    ctx.lineTo(x, y);
  }

  // Draw the stroke
  ctx.stroke();
}
```

To get the whole document as plain JSON-serializable data:

```javascript
const { tags } = gml.toData();
// tags[0].drawings[0].strokes[0].points → [{ x, y, z, t?, pressure?, rotation? }, …]
```

Collection getters (`getTags()`, `getStrokes()`, `getPoints()`, …) always return an array.

Parsing is lenient by default: an invalid element (say, a point without a `<y>`) is skipped by the getters, kept verbatim in the output, and reported in `gml.warnings` as a `GMLParseError` whose `path` points at it. Pass `{ strict: true }` to throw on the first invalid element instead. Input that isn't well-formed XML with a `<gml>` root always throws.

```javascript
const gml = new GML(str);
for (const warning of gml.warnings) {
  console.warn(warning.message); // e.g. 'Invalid GML: A "pt" node requires a "y" child node. (at gml[0]/tag[0]/drawing[0]/stroke[0]/pt[3])'
}

new GML(str, { strict: true }); // throws instead
```

`toString()` writes the document back as GML. Element order is kept, and unknown elements or attributes are written back verbatim (see `getUnknownChildren()` and `unknownAttributes`).

## Related

gmljs is the base for my other project, [gmlrender](https://github.com/dwyfl/gmlrender). It's a TypeScript library for browsers and Node.js that renders GML documents to images and videos.
