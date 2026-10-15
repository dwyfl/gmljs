import type { ReferenceScene } from "./reference.ts";

export const referenceScenes: ReferenceScene[] = [
  pairedScene("solid-rectangles", 96, 72, (context) => {
    context.fillStyle = "white";
    context.fillRect(0, 0, 96, 72);
    context.fillStyle = "rebeccapurple";
    context.fillRect(7, 9, 65, 41);
    context.fillStyle = "#20c080";
    context.fillRect(51, 33, 39, 31);
  }),
  pairedScene("translucent-overlap", 96, 72, (context) => {
    context.fillStyle = "rgba(255, 40, 10, 0.6)";
    context.fillRect(5, 7, 60, 43);
    context.fillStyle = "rgb(10 80 255 / 45%)";
    context.fillRect(31, 22, 58, 42);
  }),
  pairedScene("fractional-rectangles", 96, 72, (context) => {
    context.fillStyle = "#e02080";
    context.fillRect(4.25, 5.75, 71.5, 39.5);
    context.fillStyle = "rgb(20 180 90 / 0.7)";
    context.fillRect(22.6, 19.2, 66.1, 45.4);
  }),
  pairedScene("clear-rectangle", 96, 72, (context) => {
    context.fillStyle = "#3182ce";
    context.fillRect(0, 0, 96, 72);
    context.clearRect(17.25, 11.5, 53.5, 39.25);
  }),
  pairedScene("nonzero-evenodd-star", 160, 80, (context) => {
    context.fillStyle = "#7248d8";
    star(context, 40, 40, 34);
    context.fill("nonzero");
    context.beginPath();
    star(context, 120, 40, 34);
    context.fill("evenodd");
  }),
  pairedScene("quadratic-cubic-curves", 128, 96, (context) => {
    context.fillStyle = "rgb(230 45 100 / 80%)";
    context.beginPath();
    context.moveTo(7.5, 82.25);
    context.quadraticCurveTo(34, -18, 64.5, 52.75);
    context.bezierCurveTo(86, 103, 113, -12, 121, 77.5);
    context.bezierCurveTo(86, 65, 37, 108, 7.5, 82.25);
    context.fill();
  }),
  pairedScene("arcs-and-holes", 128, 96, (context) => {
    context.fillStyle = "#16a085";
    context.beginPath();
    context.arc(38.25, 46.5, 31.75, 0, Math.PI * 2);
    context.arc(38.25, 46.5, 13.25, 0, Math.PI * 2);
    context.fill("evenodd");

    context.beginPath();
    context.moveTo(91, 47);
    context.arc(91, 47, 31, -Math.PI * 0.8, Math.PI * 0.65);
    context.closePath();
    context.fill();
  }),
  pairedScene("slanted-polygons", 128, 96, (context) => {
    context.fillStyle = "rgba(40, 110, 240, 0.65)";
    context.beginPath();
    context.moveTo(-16.5, 22.25);
    context.lineTo(109.75, -8.5);
    context.lineTo(143.25, 68.75);
    context.lineTo(31.5, 103.25);
    context.closePath();
    context.fill();
  }),
  pairedScene("stroke-cap-join-grid", 240, 210, (context) => {
    const caps = ["butt", "round", "square"] as const;
    const joins = ["bevel", "miter", "round"] as const;
    context.strokeStyle = "#5b42c4";
    context.lineWidth = 10;
    for (const [row, cap] of caps.entries()) {
      for (const [column, join] of joins.entries()) {
        const x = 17 + column * 78;
        const y = 18 + row * 68;
        context.lineCap = cap;
        context.lineJoin = join;
        context.beginPath();
        context.moveTo(x, y + 35);
        context.lineTo(x + 22, y + 5);
        context.lineTo(x + 46, y + 35);
        context.stroke();
      }
    }
  }),
  pairedScene("stroke-self-crossing", 128, 96, (context) => {
    context.strokeStyle = "rgba(225, 40, 90, 0.55)";
    context.lineWidth = 15;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.beginPath();
    context.moveTo(13, 13);
    context.lineTo(113, 83);
    context.lineTo(113, 13);
    context.lineTo(13, 83);
    context.stroke();
  }),
  pairedScene("stroke-shallow-round-join", 96, 48, (context) => {
    context.strokeStyle = "#304fc0";
    context.lineWidth = 7;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.beginPath();
    context.moveTo(4.25, 23.375);
    context.lineTo(48, 24.125);
    context.lineTo(91.75, 23.375);
    context.stroke();
  }),
  pairedScene("stroke-near-reversal", 112, 64, (context) => {
    context.strokeStyle = "rgb(210 45 80 / 70%)";
    context.lineWidth = 9;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.beginPath();
    context.moveTo(7, 29);
    context.lineTo(101, 29);
    context.lineTo(96.5, 32.25);
    context.lineTo(16, 52);
    context.stroke();
  }),
  pairedScene("stroke-round-geometry", 160, 140, (context) => {
    context.strokeStyle = "#111827";
    context.lineCap = "round";
    context.lineJoin = "round";
    for (const [index, width] of [2, 3, 5, 9, 17, 33].entries()) {
      const x = 18 + (index % 3) * 52;
      const y = 18 + Math.floor(index / 3) * 55;
      context.lineWidth = width;
      context.beginPath();
      context.moveTo(x, y);
      context.lineTo(x, y);
      context.stroke();
    }
    context.lineWidth = 11;
    context.beginPath();
    context.moveTo(10, 120);
    context.lineTo(55, 120);
    context.stroke();
    context.beginPath();
    context.moveTo(80, 130);
    context.lineTo(105, 105);
    context.lineTo(140, 130);
    context.stroke();
  }),
  pairedScene("stroke-miter-limit", 180, 100, (context) => {
    context.strokeStyle = "#078a8a";
    context.lineWidth = 12;
    context.lineJoin = "miter";
    for (const [index, limit] of [1.5, 10].entries()) {
      context.miterLimit = limit;
      const x = 12 + index * 90;
      context.beginPath();
      context.moveTo(x, 83);
      context.lineTo(x + 35, 11);
      context.lineTo(x + 47, 83);
      context.stroke();
    }
  }),
  pairedScene("stroke-hairlines", 128, 80, (context) => {
    context.strokeStyle = "#202d50";
    for (const [index, width] of [0.5, 1].entries()) {
      context.lineWidth = width;
      context.beginPath();
      context.moveTo(5.25, 18.25 + index * 37);
      context.lineTo(121.75, 7.75 + index * 39);
      context.stroke();
    }
  }),
  pairedScene("stroke-huge-width", 128, 96, (context) => {
    context.strokeStyle = "rgb(30 120 220 / 70%)";
    context.lineWidth = 80;
    context.lineCap = "round";
    context.beginPath();
    context.moveTo(-22, 83);
    context.lineTo(72, 15);
    context.lineTo(151, 69);
    context.stroke();
  }),
];

interface SharedRectangleContext {
  fillStyle: string;
  strokeStyle: string;
  lineWidth: number;
  lineCap: "butt" | "round" | "square";
  lineJoin: "bevel" | "miter" | "round";
  miterLimit: number;
  beginPath(): void;
  closePath(): void;
  moveTo(x: number, y: number): void;
  lineTo(x: number, y: number): void;
  quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): void;
  bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): void;
  arc(
    x: number,
    y: number,
    radius: number,
    startAngle: number,
    endAngle: number,
    counterclockwise?: boolean,
  ): void;
  fill(fillRule?: "nonzero" | "evenodd"): void;
  stroke(): void;
  strokeRect(x: number, y: number, width: number, height: number): void;
  fillRect(x: number, y: number, width: number, height: number): void;
  clearRect(x: number, y: number, width: number, height: number): void;
}

function star(
  context: SharedRectangleContext,
  centerX: number,
  centerY: number,
  outerRadius: number,
): void {
  context.beginPath();
  for (const [point, vertex] of [0, 2, 4, 1, 3].entries()) {
    const angle = -Math.PI / 2 + (vertex * Math.PI * 2) / 5;
    const x = centerX + Math.cos(angle) * outerRadius;
    const y = centerY + Math.sin(angle) * outerRadius;
    if (point === 0) {
      context.moveTo(x, y);
    } else {
      context.lineTo(x, y);
    }
  }
  context.closePath();
}

function pairedScene(
  name: string,
  width: number,
  height: number,
  draw: (context: SharedRectangleContext) => void,
): ReferenceScene {
  return {
    name,
    width,
    height,
    drawOurs: draw,
    drawSkia: (context) => draw(context as unknown as SharedRectangleContext),
  };
}
