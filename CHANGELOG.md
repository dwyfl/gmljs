# Changelog

## 3.0.0 (unreleased)

gmljs 3 is a TypeScript rewrite. Typed accessors (`getXYZ()`, `getRGBA()`, `getScreenBounds()`, …) and tag names now carry types. Parsing is lenient by default and reports problems instead of failing. `toString()` writes valid, spec-cased GML that round-trips the input, unknown elements included. Browser builds no longer bundle an XML parser.

- [Upgrading from 2.x](#upgrading-from-2x)
- [Upgrading from 3.0.0-beta](#upgrading-from-300-beta)
- [Full list of changes](#full-list-of-changes)

### Requirements

- **ESM only.** There is no CommonJS build. Node ≥ 20.19 can `require("gmljs")` through `require(esm)`. Older CommonJS code needs `await import("gmljs")`.
- **Node ≥ 20.19** (`engines`).
- **Only the package root can be imported.** Deep imports such as `gmljs/lib/node/point` no longer resolve. Everything public is exported from `"gmljs"`.
- **Types are included**; you don't need `@types/gmljs`.
- **Browsers:** bundlers pick a build that uses the built-in `DOMParser` (`exports` → `browser` condition), about 6 KB gzipped. Node uses `@xmldom/xmldom`, which replaces the deprecated `xmldom`.

---

## Upgrading from 2.x

### Imports

The default export still works, and named imports are now available:

```js
import GML from "gmljs"; // still works
import { GML, GMLNodeName, GMLParseError } from "gmljs";
```

### `GML` methods

The 2.x getters took an optional trailing index and returned either an array or a single node (or `null`). 3.0 splits each of them in two:

| 2.x                                           | 3.0                                                                                                              |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `gml.getTags()`                               | `gml.getTags()` (always an array)                                                                                |
| `gml.getTags(i)`                              | `gml.getTag(i)`                                                                                                  |
| `gml.getDrawings(tag)`                        | `gml.getDrawings(tag)`                                                                                           |
| `gml.getDrawings(tag, i)`                     | `gml.getDrawing(tag, i)`                                                                                         |
| `gml.getStrokes(tag, drawing)`                | `gml.getStrokes(tag, drawing)`                                                                                   |
| `gml.getStrokes(tag, drawing, i)`             | `gml.getStroke(tag, drawing, i)`                                                                                 |
| `gml.getPoints(tag, drawing, stroke)`         | `gml.getPoints(tag, drawing, stroke)`                                                                            |
| `gml.getPoints(tag, drawing, stroke, i)`      | `gml.getPoint(tag, drawing, stroke, i)`                                                                          |
| `gml.getRoot()`                               | `gml.getRoot()`                                                                                                  |
| `gml.getClient()`                             | `gml.getClient()` (the `<client>` node, as before)                                                               |
| `gml.getTitle()`                              | `gml.getTitle()`: the client's `<username>`, now falling back to its `<name>`                                    |
| `GML.createFromPointArrays(strokes, options)` | `createGMLDocumentFromPointArrays(strokes, options)`, which returns the document node (call `.toString()` on it) |
| `GML.createNodeFromXml(NodeClass, xml)`       | `createGmlNodeFromXml(xml)`; the node type comes from the root tag                                               |
| `GML.parseXml(xml)`                           | `parseGML(xml)`, which returns a parsed GML document rather than an XML DOM                                      |
| `gml.doc = …`                                 | `gml.init(xml)`; `doc` is read-only                                                                              |

Single-item getters return `undefined` instead of `null` when nothing is found. Collection getters always return an array (readonly in TypeScript), even when the parent is missing.

New in 3.0: `gml.strokes()` iterates the strokes of every drawing in every tag. `gml.toData()` returns the whole document as plain, JSON-serializable data. `gml.warnings` lists problems found while parsing. `gml.getSize()` returns `[width, height]` from `<screenBounds>`.

```js
// 2.x
gml.getStrokes(0, 0).forEach((stroke) => {
  stroke.getPoints().forEach((pt) => draw(pt.values.x, pt.values.y));
});

// 3.0
for (const stroke of gml.strokes()) {
  for (const pt of stroke.getPoints()) {
    const [x, y] = pt.getXYZ();
    draw(x, y);
  }
}
```

### Nodes

| 2.x                                       | 3.0                                                                          |
| ----------------------------------------- | ---------------------------------------------------------------------------- |
| `point.getVector()`                       | `point.getXYZ()`, which returns `[x, y, z]` with missing values as `0`       |
| `point.values`                            | `point.values` (unchanged; includes only the children that are present)      |
| `point.values.t`                          | `point.getT()`                                                               |
| `stroke.getPoints(i)`                     | `stroke.getPoint(i)`                                                         |
| `node.getChild(name, defaultValue)`       | `node.getChild(name) ?? defaultValue`                                        |
| `node.getChildPath(path, defaultValue)`   | `node.getChildPath(path) ?? defaultValue`                                    |
| `node.getAttribute(name, defaultValue)`   | `node.getAttribute(name) ?? defaultValue`                                    |
| `node.children.pt = [...]`                | `node.addChild("pt", point)` / `node.removeChild("pt", index)`               |
| `new GMLPoint()` / `GMLPoint.create(...)` | `createGmlNodeFromTagName("pt")`, or `parseGML()` / `createGmlNodeFromXml()` |

There are also new typed accessors: `stroke.isDrawing()` (a boolean), `stroke.getBrush()`, `brush.getWidth()`, `brush.getColor()`, `brush.getDrip()`, `color.getRGBA()`, `color.getNormalizedRGBA()`, `tag.getEnvironment()`, `environment.getScreenBounds()` / `getUp()` / `getOffset()` / `getRotation()`. Every structural node also has a `toData()`.

`getChild()`, `getChildren()` and `getChildPath()` infer the node type from the tag name, so `stroke.getChild("brush")` is a `GMLBrush`.

### Parsing

- **Malformed XML** throws a `GMLParseError` (2.x threw a plain `Error("Unable to parse GML!")`). XML that browsers reject also fails in Node: unquoted attributes, unknown entities, text outside the root element.
- **The root element must be `<gml>`** (any case). Other input throws instead of producing an empty document.
- **Invalid GML is reported, not fatal.** A point without `<y>` or a value like `<x>oops</x>` is skipped by the getters, kept verbatim in the output, and listed in `gml.warnings`. Each warning is a `GMLParseError` with a `path` such as `["gml[0]", "tag[0]", "drawing[0]", "stroke[0]", "pt[3]"]`. Pass `{ strict: true }` to throw on the first problem instead:

  ```js
  const gml = new GML(xml); // lenient
  gml.warnings.forEach((warning) => console.warn(warning.message));

  new GML(xml, { strict: true }); // throws GMLParseError
  ```

- **Numbers must be plain decimals.** `"1.5abc"` used to parse as `1.5`. Now it's invalid.
- **Leaf text is trimmed and kept whole**, so multi-line values are no longer cut off at the first line break.

### Output (`toString()`)

- Tag and attribute names use the spec's casing (`screenBounds`, `uniqueStyleID`, `isDrawing`, …). 2.x wrote them lowercased.
- Text and attribute values are escaped. 2.x wrote them raw, which could produce invalid XML.
- Element order is preserved. Unknown elements and attributes are written back verbatim instead of being dropped.
- Parsed documents are written as they were read. Defaults (`isDrawing="true"`, `spec="1.0"`, a missing `<z>`) are only added to nodes you create yourself.

### Colors

`getRGBA()` uses the spec's 0–255 scale, and a missing `<a>` means opaque (`255`). Use `getNormalizedRGBA()` for 0–1 values (canvas `rgba()` alpha, WebGL).

---

## Upgrading from 3.0.0-beta

These are breaking changes since `3.0.0-beta.4`.

### API

- **`getClient()` returns the `<client>` node** (as in 2.x) instead of a string. For the application name use `gml.getTag(0)?.getClientName()` or `gml.getClient()?.toData().name`.
- **`getTitle()` prefers `<username>`** and falls back to `<name>`. It used to be the other way round.
- **Collection getters always return arrays.** `GML.getDrawings/getStrokes/getPoints`, `GMLTag.getDrawings`, `GMLStroke.getPoints` and `GMLRoot.getTags` returned `T[] | undefined`; they now return `readonly T[]`. `?.` and `?? []` are no longer needed. Code that mutated these arrays must use `addChild()` / `removeChild()`.
- **The type parameter of `getChild`/`getChildren`/`getChildPath` is now inferred from the tag name.** Drop the explicit class argument:

  ```ts
  // beta
  stroke.getChild<GMLBrush>(GMLNodeName.BRUSH);
  doc.getChildPath<GMLTag>([GMLNodeName.ROOT, GMLNodeName.TAG]);
  // 3.0
  stroke.getChild(GMLNodeName.BRUSH); // GMLBrush | undefined
  doc.getChildPath([GMLNodeName.ROOT, GMLNodeName.TAG]); // GMLTag | undefined
  ```

- **`isDrawing()` returns a `boolean`.** It's `true` unless the stroke has `isDrawing="false"` (case-insensitive).
- **`getRGBA()` / `brush.getColor()` default alpha to `255`**, not `1`. See [Colors](#colors).
- **`toObject()` has a new shape.** A leaf becomes its value and a container becomes `{ [tagName]: child[] }`, e.g. `{ x: [1], y: [2] }`. For application data prefer the new typed `toData()`.
- **`node.children` and `node.definition` are read-only**, and `GML.doc` can't be reassigned (use `init()`).
- **Node constructors take only a definition.** Create nodes with `createGmlNodeFromTagName()`, `createGmlNodeFromXml()`, `parseGML()` or `createGmlNode(definition, data)`.
- **Per-tag leaf classes are gone.** Internal classes such as `GMLTime`, `GMLPointX` and `GMLEnvScreenBounds` are replaced by the generic `GMLLeafNode`, `GMLFloatNode`, `GMLIntegerNode`, `GML3DPoint` and `GMLLeafNodeParent`. They were never exported, but they could appear in inferred types.
- **`<lat>` and `<lon>` are numbers.**

### Behavior

- **Parsing is lenient by default** and **throws `GMLParseError`** for unrecoverable input; see [Parsing](#parsing).
- **Output changed**: escaping, spec casing, preserved order and unknown elements, no injected defaults. See [Output](#output-tostring). Snapshot tests of `toString()` output will need updating.

---

## Full list of changes

### Added

- `parseGML(xml, options)`, `createGmlNodeFromXml(xml, options)`, `createGmlNodeFromTagName(name)`, `createGmlNode(definition, data, options)` and `createGMLDocumentFromPointArrays(strokes, { screenBounds })` are exported.
- Parse options: `strict` and `onWarning`. Documents expose `warnings`.
- `GMLParseError` with `reason` and `path`.
- `gml.strokes()` iterator, and `toData()` on `GML` and on every structural node, with typed results (`GMLData`, `GMLStrokeData`, `GMLPointData`, …).
- `GMLColor.getNormalizedRGBA()`.
- Round-trip support: `GMLUnknownNode`, `node.getChildNodes()` (document order), `node.getUnknownChildren()`, `node.unknownAttributes`.
- Exported constants and types: `GMLNodeName`, `GMLNodeAttribute`, `isGMLNodeName`, `isGMLNodeAttribute`, `GMLNodeTypeMap`, `GMLNodeAtPath` and the node classes.
- A browser build that uses the native `DOMParser`/`XMLSerializer`.
- `package.json` adds a `types` condition, `main`/`types` fallbacks, `engines` and `sideEffects: false`.

### Changed

- See the breaking changes above. Behavior differences from 2.x are covered in [Upgrading from 2.x](#upgrading-from-2x).

### Fixed

- `toString()` produced invalid XML for values containing `&`, `<`, `>` or `"`.
- Multi-line or indented text values were truncated to their first line (often to `""`).
- `removeChild(name, 0)` removed every child with that name instead of the first one.
- `<time>` inside `<pt>` was parsed as an integer, so `.5` failed. It's a float again, as in 2.x.
- `createGMLDocumentFromPointArrays()` ignored the `screenBounds` option.
- `GMLTag.getClientName()` returned `""` instead of `"unknown"` when the client had no name.
- `toObject()` lost leaf values.
- Parsing no longer prints xmldom errors to `console.error`.
- Required child elements (e.g. `<screenBounds>` without `<y>`) are reported instead of being filled with defaults.
