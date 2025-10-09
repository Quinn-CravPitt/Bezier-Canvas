import React, { useState, useRef, useEffect } from "react";
/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */

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

  const createInitialCurve = React.useCallback(() => {
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
  }, [canvasWidth, bottomLine, topLine]);

  useEffect(() => {
    setPoints(createInitialCurve());
  }, [createInitialCurve]);

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

    // Background + dashed guides
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = "#999";
    ctx.beginPath();
    ctx.moveTo(0, topLine);
    ctx.lineTo(canvasWidth, topLine);
    ctx.moveTo(0, bottomLine);
    ctx.lineTo(canvasWidth, bottomLine);
    ctx.stroke();
    ctx.setLineDash([]);

    // Labels
    ctx.font = "16px Arial";
    ctx.fillStyle = "black";
    ctx.fillText(
      `${canvasWidthInches.toFixed(2)} in`,
      canvasWidth - 60,
      topLine + 20
    );

    // Height line
    const centerX = canvasWidth / 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(centerX, topLine);
    ctx.lineTo(centerX, bottomLine);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillText(
      `${canvasHeightInches.toFixed(2)} in`,
      centerX + 5,
      canvasHeight / 2
    );

    // Draw curve + brown fill
    if (points.length >= 4) {
      const path = new Path2D();
      path.moveTo(points[0].x, points[0].y);
      for (let i = 0; i < points.length - 3; i += 3) {
        const [p0, p1, p2, p3] = points.slice(i, i + 4);
        path.bezierCurveTo(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
      }

      // Fill left side (brown)
      const fillPath = new Path2D(path);
      fillPath.lineTo(centerX, bottomLine);
      fillPath.lineTo(centerX, topLine);
      fillPath.closePath();
      ctx.fillStyle = "#8B4513"; // brown color
      ctx.fill(fillPath);

      // Draw the blue stroke over it
      ctx.strokeStyle = "blue";
      ctx.lineWidth = 2;
      ctx.stroke(path);

      // Control lines
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

    // Points
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

  const exportSVG = () => {
    if (points.length < 4) return;
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${canvasWidth}" height="${canvasHeight}">\n`;
    for (let i = 0; i < points.length - 3; i += 3) {
      const [p0, p1, p2, p3] = points.slice(i, i + 4);
      svg += `<path d="M ${p0.x} ${p0.y} C ${p1.x} ${p1.y}, ${p2.x} ${p2.y}, ${p3.x} ${p3.y}" stroke="blue" fill="none" stroke-width="2"/>\n`;
    }
    svg += "</svg>";
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "bezier_drawing.svg";
    link.click();
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", gap: "40px", alignItems: "flex-start", padding: "20px" }}>
      {/* Left: Video Tutorial */}
      <div style={{ maxWidth: 400 }}>
        <h3 style={{ textAlign: "center" }}>How to Use This App</h3>
        <iframe
          width="100%"
          height="250"
          src="https://www.youtube.com/embed/MpOIOfbsSao?si=w4G7JN4rnNT3t44C"
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          style={{ borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.2)" }}
        ></iframe>
      </div>

      {/* Right: Canvas */}
      <div style={{ textAlign: "center" }}>
        <h2>Bezier Curve Drawer</h2>
        <div style={{ marginBottom: "10px" }}>
          <label>Height (in): </label>
          <input
            type="range"
            min="1"
            max="8"
            step="0.1"
            value={canvasHeightInches}
            onChange={(e) => setCanvasHeightInches(parseFloat(e.target.value))}
          />
          <span> {canvasHeightInches.toFixed(1)}</span>
        </div>
        <div>
          <label>Width (in): </label>
          <input
            type="range"
            min="1"
            max="8"
            step="0.1"
            value={canvasWidthInches}
            onChange={(e) => setCanvasWidthInches(parseFloat(e.target.value))}
          />
          <span> {canvasWidthInches.toFixed(1)}</span>
        </div>
        <canvas
          ref={canvasRef}
          width={canvasWidth}
          height={canvasHeight}
          style={{
            border: "2px solid #333",
            borderRadius: "10px",
            marginTop: "15px",
            background: "#fafafa",
          }}
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
    </div>
  );
};

export default BezierCanvas;
