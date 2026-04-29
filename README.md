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

  // Begin draw to canvas
  ctx.beginPath();
  ctx.moveTo(firstPoint.values.x, firstPoint.values.y);

  for (const pt of points) {
    ctx.lineTo(pt.x, pt.y);
  }

  // Draw the stroke
  ctx.stroke();
}
```

## Related

gmljs is the base for my other project, [gmlrender](https://github.com/dwyfl/gmlrender). It's a TypeScript library for browsers and Node.js that renders GML documents to images or video. [Check it out!](https://github.com/dwyfl/gmlrender)
