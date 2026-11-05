---
"@gmljs/core": patch
"@gmljs/cli": patch
---

Add `GMLEnvironment.rotate(degrees)`, which rotates a document's `<up>` vector clockwise (swapping `<screenBounds>` width/height for 90°/270°), and a `gmljs --rotate <degrees>` CLI option built on it, for documents that render in the wrong orientation.
