// src/BezierCanvas.js
import React, { useState, useRef, useEffect, useCallback } from "react";

const PIXELS_PER_INCH = 96;

const BezierCanvas = () => {
  const canvasRef = useRef(null);

  const [canvasWidthInches, setCanvasWidthInches] = useState(3);
  const [canvasHeightInches, setCanvasHeightInches] = useState(8);

  const canvasWidth = canvasWidthInches * PIXELS_PER_INCH;
  const canvasHeight = canvasHeightInches * PIXELS_PER_INCH;

  const topLine = 0;
  const bottomLine = canvasHeight - 0;

  const [points, setPoints] = useState([]);
  const [dragging, setDragging] = useState(null);

  // Initial Bezier curve
  const createInitialCurve = useCallback(() => {
    const midX = canvasWidth / 2;
    return [
      {
        x: midX,
        y: topLine + canvasHeight * 0.1, // slightly below top
        cp1: { x: midX - 50, y: topLine + canvasHeight * 0.25 },
        cp2: { x: midX + 50, y: bottomLine - canvasHeight * 0.25 },
      },
      {
        x: midX,
        y: bottomLine - canvasHeight * 0.1, // slightly above bottom
        cp1: { x: midX - 50, y: bottomLine - canvasHeight * 0.25 },
        cp2: { x: midX + 50, y: bottomLine - canvasHeight * 0.1 },
      },
    ];
  }, [canvasWidth, canvasHeight, topLine, bottomLine]);

  useEffect(() => {
    setPoints(createInitialCurve());
  }, [createInitialCurve]);

  // Draw the canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Draw top and bottom dashed lines
    ctx.strokeStyle = "#888";
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(0, topLine);
    ctx.lineTo(canvasWidth, topLine);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, bottomLine);
    ctx.lineTo(canvasWidth, bottomLine);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw Bezier curves and control lines
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];

      // Control lines
      ctx.strokeStyle = "#aaa";
      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(p0.cp1.x, p0.cp1.y);
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p1.cp2.x, p1.cp2.y);
      ctx.stroke();

      // Bezier curve
      ctx.strokeStyle = "#000";
      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.bezierCurveTo(
        p0.cp2.x,
        p0.cp2.y,
        p1.cp1.x,
        p1.cp1.y,
        p1.x,
        p1.y
      );
      ctx.stroke();
    }

    // Draw points and control points
    points.forEach((p) => {
      ctx.fillStyle = "blue";
      ctx.beginPath();
      ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "red";
      ctx.beginPath();
      ctx.arc(p.cp1.x, p.cp1.y, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(p.cp2.x, p.cp2.y, 4, 0, Math.PI * 2);
      ctx.fill();
    });
  }, [points, canvasWidth, canvasHeight, topLine, bottomLine]);

  const getMousePos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseDown = (e) => {
    const pos = getMousePos(e);
    // Check if clicking near an existing point or control point
    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      if (Math.hypot(pos.x - p.x, pos.y - p.y) < 8) {
        setDragging({ index: i, type: "anchor" });
        return;
      }
      if (Math.hypot(pos.x - p.cp1.x, pos.y - p.cp1.y) < 8) {
        setDragging({ index: i, type: "cp1" });
        return;
      }
      if (Math.hypot(pos.x - p.cp2.x, pos.y - p.cp2.y) < 8) {
        setDragging({ index: i, type: "cp2" });
        return;
      }
    }

    // Click on curve -> add new point
    setPoints((prev) => {
      const lastPoint = prev[prev.length - 1];
      const newX = pos.x;
      const newY = pos.y;
      const newPoint = {
        x: newX,
        y: newY,
        cp1: { x: newX - 50, y: newY - 50 },
        cp2: { x: newX + 50, y: newY + 50 },
      };
      return [...prev, newPoint];
    });
  };

  const handleMouseMove = (e) => {
    if (!dragging) return;
    const pos = getMousePos(e);
    setPoints((prev) => {
      const newPoints = [...prev];
      const p = newPoints[dragging.index];
      if (dragging.type === "anchor") {
        p.x = pos.x;
        p.y = pos.y;
      }
      if (dragging.type === "cp1") {
        p.cp1.x = pos.x;
        p.cp1.y = pos.y;
      }
      if (dragging.type === "cp2") {
        p.cp2.x = pos.x;
        p.cp2.y = pos.y;
      }
      return newPoints;
    });
  };

  const handleMouseUp = () => {
    setDragging(null);
  };

  const resetCanvas = () => {
    setPoints(createInitialCurve());
  };

  const exportSVG = () => {
    if (points.length < 2) return;

    const svgParts = [];
    svgParts.push(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${canvasWidth}" height="${canvasHeight}">`
    );

    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];

      // Skip if points are outside top/bottom lines
      if (
        p0.y < topLine ||
        p0.y > bottomLine ||
        p1.y < topLine ||
        p1.y > bottomLine
      )
        continue;

      svgParts.push(
        `<path d="M ${p0.x},${p0.y} C ${p0.cp2.x},${p0.cp2.y} ${p1.cp1.x},${p1.cp1.y} ${p1.x},${p1.y}" stroke="black" fill="transparent"/>`
      );
    }

    svgParts.push("</svg>");
    const blob = new Blob([svgParts.join("\n")], { type: "image/svg+xml" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "bezier.svg";
    link.click();
  };

  return (
    <div>
      <div style={{ marginBottom: "10px" }}>
        <label>
          Width (inches):
          <input
            type="number"
            min="1"
            max="8"
            step="0.1"
            value={canvasWidthInches}
            onChange={(e) => setCanvasWidthInches(parseFloat(e.target.value))}
          />
        </label>
        <label style={{ marginLeft: "10px" }}>
          Height (inches):
          <input
            type="number"
            min="1"
            max="8"
            step="0.1"
            value={canvasHeightInches}
            onChange={(e) =>
              setCanvasHeightInches(parseFloat(e.target.value))
            }
          />
        </label>
        <button style={{ marginLeft: "10px" }} onClick={resetCanvas}>
          Reset
        </button>
        <button style={{ marginLeft: "10px" }} onClick={exportSVG}>
          Export SVG
        </button>
      </div>
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        style={{ border: "1px solid black" }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />
    </div>
  );
};

export default BezierCanvas;
