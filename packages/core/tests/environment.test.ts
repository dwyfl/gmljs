import { describe, it, expect } from "vite-plus/test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createGmlNodeFromTagName, createGmlNodeFromXml } from "../src/gml/util/index.ts";
import { GMLNodeName } from "../src/gml/types.ts";
import type { GMLEnvironment } from "../src/gml/nodes/environment/index.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const testXml = readFileSync(join(__dirname, "data/environment.xml"), "utf-8");

describe("GMLEnvironment", () => {
  it("creates a default GMLEnvironment node", () => {
    const gml = createGmlNodeFromTagName(GMLNodeName.ENVIRONMENT).toString();
    expect(gml).toMatchSnapshot();
  });
  it("creates a GMLEnvironment node from spec XML", () => {
    const gml = createGmlNodeFromXml(testXml).toString();
    expect(gml).toMatchSnapshot();
  });
});

describe("GMLEnvironment.rotate()", () => {
  // Default <up> is (0, -1, 0) and default <screenBounds> is (1920, 1080).
  it("rotate(90) turns up clockwise and swaps screenBounds", () => {
    const env = createGmlNodeFromTagName(GMLNodeName.ENVIRONMENT);
    env.rotate(90);
    expect(env.getUp()).toEqual([-1, 0, 0]);
    expect(env.getScreenBounds()).toEqual([1080, 1920]);
  });

  it("rotate(180) flips up and leaves screenBounds untouched", () => {
    const env = createGmlNodeFromTagName(GMLNodeName.ENVIRONMENT);
    env.rotate(180);
    // This is the exact orientation that renders upside down (see environment.test.ts
    // render-side coverage in @gmljs/render), which is what prompted --rotate to exist.
    expect(env.getUp()).toEqual([0, 1, 0]);
    expect(env.getScreenBounds()).toEqual([1920, 1080]);
  });

  it("rotate(270) turns up counterclockwise and swaps screenBounds", () => {
    const env = createGmlNodeFromTagName(GMLNodeName.ENVIRONMENT);
    env.rotate(270);
    expect(env.getUp()).toEqual([1, 0, 0]);
    expect(env.getScreenBounds()).toEqual([1080, 1920]);
  });

  it("four 90° rotations return to the original up and screenBounds", () => {
    const env = createGmlNodeFromTagName(GMLNodeName.ENVIRONMENT);
    const originalUp = env.getUp();
    const originalBounds = env.getScreenBounds();
    for (let i = 0; i < 4; i++) {
      env.rotate(90);
    }
    expect(env.getUp()).toEqual(originalUp);
    expect(env.getScreenBounds()).toEqual(originalBounds);
  });

  it("creates <up>/<screenBounds> with gmljs's defaults before rotating, when missing", () => {
    const env = createGmlNodeFromXml(
      "<environment><offset><x>0</x><y>0</y><z>0</z></offset></environment>",
    ) as GMLEnvironment;
    expect(env.getUp()).toBeUndefined();
    expect(env.getScreenBounds()).toBeUndefined();

    env.rotate(90);

    expect(env.getUp()).toEqual([-1, 0, 0]);
    expect(env.getScreenBounds()).toEqual([1080, 1920]);
  });

  it("round-trips the rotated up/screenBounds through toString()/parse", () => {
    const env = createGmlNodeFromTagName(GMLNodeName.ENVIRONMENT);
    env.rotate(90);
    const reparsed = createGmlNodeFromXml(env.toString()) as GMLEnvironment;
    expect(reparsed.getUp()).toEqual(env.getUp());
    expect(reparsed.getScreenBounds()).toEqual(env.getScreenBounds());
  });
});

describe("GMLEnvironment setters", () => {
  it("setScreenBounds() sets width/height", () => {
    const env = createGmlNodeFromTagName(GMLNodeName.ENVIRONMENT);
    env.setScreenBounds(640, 480);
    expect(env.getScreenBounds()).toEqual([640, 480]);
  });

  it("setOffset() sets x/y/z, creating <offset> if missing", () => {
    const env = createGmlNodeFromTagName(GMLNodeName.ENVIRONMENT);
    expect(env.getOffset()).toBeUndefined();
    env.setOffset(1, 2, 3);
    expect(env.getOffset()).toEqual([1, 2, 3]);
  });

  it("setOffset() without z leaves an existing z untouched", () => {
    const env = createGmlNodeFromTagName(GMLNodeName.ENVIRONMENT);
    env.setOffset(1, 2, 3);
    env.setOffset(4, 5);
    expect(env.getOffset()).toEqual([4, 5, 3]);
  });

  it("setRotation() sets the <rotation> point", () => {
    const env = createGmlNodeFromTagName(GMLNodeName.ENVIRONMENT);
    expect(env.getRotation()).toBeUndefined();
    env.setRotation(10, 20, 30);
    expect(env.getRotation()).toEqual([10, 20, 30]);
  });

  it("setOrigin() sets the <origin> point", () => {
    const env = createGmlNodeFromTagName(GMLNodeName.ENVIRONMENT);
    expect(env.getOrigin()).toBeUndefined();
    env.setOrigin(0.1, 0.2, 0.3);
    expect(env.getOrigin()).toEqual([0.1, 0.2, 0.3]);
  });

  it("setRealScale() sets the <realScale> point", () => {
    const env = createGmlNodeFromTagName(GMLNodeName.ENVIRONMENT);
    expect(env.getRealScale()).toBeUndefined();
    env.setRealScale(1000, 600, 0);
    expect(env.getRealScale()).toEqual([1000, 600, 0]);
  });

  it("round-trips every setter through toString()/parse", () => {
    const env = createGmlNodeFromTagName(GMLNodeName.ENVIRONMENT);
    env.setScreenBounds(640, 480);
    env.setOffset(1, 2, 3);
    env.setRotation(4, 5, 6);
    env.setOrigin(7, 8, 9);
    env.setRealScale(10, 11, 12);

    const reparsed = createGmlNodeFromXml(env.toString()) as GMLEnvironment;
    expect(reparsed.getScreenBounds()).toEqual(env.getScreenBounds());
    expect(reparsed.getOffset()).toEqual(env.getOffset());
    expect(reparsed.getRotation()).toEqual(env.getRotation());
    expect(reparsed.getOrigin()).toEqual(env.getOrigin());
    expect(reparsed.getRealScale()).toEqual(env.getRealScale());
  });
});
