# gmljs

- It's a JavaScript library for parsing [GML (Graffiti Markup Language)](https://en.wikipedia.org/wiki/Graffiti_Markup_Language) documents.
- It has full TypeScript support.
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

// Iterate over all strokes in tag 0, drawing 0
for (const stroke of gml.getStrokes(0, 0)) {
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

Collection getters (`getTags()`, `getStrokes()`, `getPoints()`, …) always return an array, and invalid input throws a `GMLParseError` whose `path` points at the offending element.

`toString()` writes the document back as GML, using the spec's tag casing (`screenBounds`, `isDrawing`, …) and escaping text and attribute values.

## Related

gmljs is the base for my other project, [gmlrender](https://github.com/dwyfl/gmlrender). It's a TypeScript library for browsers and Node.js that renders GML documents to images or video. [Check it out!](https://github.com/dwyfl/gmlrender)
