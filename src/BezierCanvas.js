import React, { useState, useRef, useEffect } from "react";

const PIXELS_PER_INCH = 96;
const SAMPLE_POINTS = 100;
const CLICK_THRESHOLD = 10;

const BezierCanvas = () => {
  const [canvasHeightInches, setCanvasHeightInches] = useState(8);
  const [canvasWidthInches, setCanvasWidthInches] = useState(3);
  const [points, setPoints] = useState([]);
  const [draggingPointIndex, setDraggingPointIndex] = useState(null);
  const canvasRef = useRef(null);

  const canvasWidth = canvasWidthInches * PIXELS_PER_INCH;
  const canvasHeight = canvasHeightInches * PIXELS_PER_INCH;
  const topLine = 0;
  const bottomLine = canvasHeight;

  const createInitialCurve = () => {
    const start = { x: canvasWidth / 2, y: topLine, isEnd: true, lockY: true };
    const end = { x: canvasWidth / 2, y: bottomLine, isEnd: true, lockY: true };
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const dist = Math.hypot(dx, dy) || 1;
    const nx = dx / dist;
    const ny = dy / dist;
    const c1 = {
      x: start.x + nx * 50 - ny * 30,
      y: start.y + ny * 50 + nx * 30,
    };
    const c2 = { x: end.x - nx * 50 + ny * 30, y: end.y - ny * 50 - nx * 30 };
    return [start, c1, c2, end];
  };

useEffect(() => {
  setPoints(createInitialCurve());
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [canvasHeightInches, canvasWidthInches]);

  const bezierPoint = (t, p0, p1, p2, p3) => {
    const u = 1 - t;
    const x =
      u ** 3 * p0.x +
      3 * u ** 2 * t * p1.x +
      3 * u * t ** 2 * p2.x +
      t ** 3 * p3.x;
    const y =
      u ** 3 * p0.y +
      3 * u ** 2 * t * p1.y +
      3 * u * t ** 2 * p2.y +
      t ** 3 * p3.y;
    return { x, y };
  };

  // Draw canvas
  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Horizontal dashed lines
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = "#999";
    ctx.beginPath();
    ctx.moveTo(0, topLine);
    ctx.lineTo(canvasWidth, topLine);
    ctx.moveTo(0, bottomLine);
    ctx.lineTo(canvasWidth, bottomLine);
    ctx.stroke();

    // Display width above top dashed line
    ctx.setLineDash([]);
    ctx.font = "16px Arial";
    ctx.fillStyle = "black";
    ctx.fillText(
      `${canvasWidthInches.toFixed(2)} in`,
      canvasWidth - 50,
      topLine + 15
    );

    // Vertical dashed line (height indicator)
    const heightLineX = canvasWidth / 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(heightLineX, topLine);
    ctx.lineTo(heightLineX, bottomLine);
    ctx.stroke();
    ctx.setLineDash([]);

    // Display height
    const heightInches = ((bottomLine - topLine) / PIXELS_PER_INCH).toFixed(2);
    ctx.fillText(
      `${heightInches} in`,
      heightLineX + 5,
      (topLine + bottomLine) / 2
    );

    // Draw Bézier curve
    if (points.length >= 4) {
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 0; i < points.length - 3; i += 3) {
        const [p0, p1, p2, p3] = points.slice(i, i + 4);
        ctx.bezierCurveTo(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
      }
      ctx.strokeStyle = "blue";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw control lines
      for (let i = 0; i < points.length - 3; i += 3) {
        const [p0, p1, p2, p3] = points.slice(i, i + 4);
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.moveTo(p2.x, p2.y);
        ctx.lineTo(p3.x, p3.y);
        ctx.strokeStyle = "gray";
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    // Draw points
    points.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 6, 0, 2 * Math.PI);
      ctx.fillStyle = p.isEnd ? "red" : "black";
      ctx.fill();
    });
  }, [points, canvasHeight, canvasWidth]);

  const handleMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    for (let i = 0; i < points.length; i++) {
      if (Math.hypot(points[i].x - x, points[i].y - y) < 10) {
        setDraggingPointIndex(i);
        return;
      }
    }

    for (let i = 0; i < points.length - 3; i += 3) {
      const [p0, p1, p2, p3] = points.slice(i, i + 4);
      for (let t = 0; t <= 1; t += 1 / SAMPLE_POINTS) {
        const pt = bezierPoint(t, p0, p1, p2, p3);
        if (Math.hypot(pt.x - x, pt.y - y) <= CLICK_THRESHOLD) {
          const newPoint = { x, y, isEnd: false };
          const dx = p3.x - p0.x;
          const dy = p3.y - p0.y;
          const dist = Math.hypot(dx, dy) || 1;
          const nx = dx / dist;
          const ny = dy / dist;
          const c1 = {
            x: newPoint.x - nx * 20 - ny * 10,
            y: newPoint.y - ny * 20 + nx * 10,
          };
          const c2 = {
            x: newPoint.x + nx * 20 + ny * 10,
            y: newPoint.y + ny * 20 - nx * 10,
          };
          const newPoints = [
            ...points.slice(0, i + 1),
            c1,
            newPoint,
            c2,
            ...points.slice(i + 1),
          ];
          setPoints(newPoints);
          return;
        }
      }
    }
  };

  const handleMouseMove = (e) => {
    if (draggingPointIndex === null) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setPoints((prev) => {
      const updated = [...prev];
      const point = updated[draggingPointIndex];
      updated[draggingPointIndex] = point.lockY
        ? { ...point, x }
        : { ...point, x, y };
      return updated;
    });
  };

  const handleMouseUp = () => setDraggingPointIndex(null);
  const handleReset = () => setPoints(createInitialCurve());

  const segmentsIntersect = (p1, p2, q1, q2) => {
    const cross = (a, b) => a.x * b.y - a.y * b.x;
    const subtract = (a, b) => ({ x: a.x - b.x, y: a.y - b.y });
    const r = subtract(p2, p1);
    const s = subtract(q2, q1);
    const denom = cross(r, s);
    if (denom === 0) return false;
    const u = cross(subtract(q1, p1), r) / denom;
    const t = cross(subtract(q1, p1), s) / denom;
    return t >= 0 && t <= 1 && u >= 0 && u <= 1;
  };

  const checkSelfIntersection = (points) => {
    const sampled = [];
    for (let i = 0; i < points.length - 3; i += 3) {
      const [p0, p1, p2, p3] = points.slice(i, i + 4);
      for (let t = 0; t <= 1; t += 1 / SAMPLE_POINTS) {
        sampled.push(bezierPoint(t, p0, p1, p2, p3));
      }
    }
    for (let i = 0; i < sampled.length - 1; i++) {
      for (let j = i + 2; j < sampled.length - 1; j++) {
        if (
          segmentsIntersect(
            sampled[i],
            sampled[i + 1],
            sampled[j],
            sampled[j + 1]
          )
        )
          return true;
      }
    }
    return false;
  };

  const exportSVG = () => {
    if (points.length < 4) return;
    if (checkSelfIntersection(points)) {
      alert("Cannot export: the Bézier curve overlaps itself!");
      return;
    }
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${canvasWidth}" height="${canvasHeight}">\n`;
    for (let i = 0; i < points.length - 3; i += 3) {
      const [p0, p1, p2, p3] = points.slice(i, i + 4);
      const clipped = [p0, p1, p2, p3].map((p) => ({
        x: p.x,
        y: Math.min(Math.max(p.y, topLine), bottomLine),
      }));
      svg += `<path d="M ${clipped[0].x} ${clipped[0].y} C ${clipped[1].x} ${clipped[1].y}, ${clipped[2].x} ${clipped[2].y}, ${clipped[3].x} ${clipped[3].y}" stroke="blue" fill="none" stroke-width="2"/>\n`;
    }
    svg += "</svg>";
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "bezier_drawing.svg";
    link.click();
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h2>Bezier Curve Drawer</h2>
      <div>
        <label>Height (inches): </label>
        <input
          type="range"
          min="1"
          max="8"
          step="0.1"
          value={canvasHeightInches}
          onChange={(e) => setCanvasHeightInches(parseFloat(e.target.value))}
        />
        <span>{canvasHeightInches.toFixed(1)} in</span>
      </div>
      <div>
        <label>Width (inches): </label>
        <input
          type="range"
          min="1"
          max="8"
          step="0.1"
          value={canvasWidthInches}
          onChange={(e) => setCanvasWidthInches(parseFloat(e.target.value))}
        />
        <span>{canvasWidthInches.toFixed(1)} in</span>
      </div>
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        style={{ border: "1px solid black", marginTop: 10, background: "#fff" }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />
      <div style={{ marginTop: 10 }}>
        <button onClick={handleReset}>Reset Curve</button>
        <button onClick={exportSVG} style={{ marginLeft: 10 }}>
          Export SVG
        </button>
      </div>
    </div>
  );
};

export default BezierCanvas;
