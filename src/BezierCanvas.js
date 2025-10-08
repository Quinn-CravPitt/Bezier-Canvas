// src/BezierCanvas.js
import React, { useState, useRef, useEffect, useCallback } from "react";

const INCH_TO_PX = 96; // 1 inch = 96px

export default function BezierCanvas() {
  const canvasRef = useRef(null);

  const [canvasHeightInches, setCanvasHeightInches] = useState(8);
  const [canvasWidthInches, setCanvasWidthInches] = useState(3);
  const [points, setPoints] = useState([]);

  const canvasHeight = canvasHeightInches * INCH_TO_PX;
  const canvasWidth = canvasWidthInches * INCH_TO_PX;

  const topLine = 0;
  const bottomLine = canvasHeight;

  // Initialize curve
  const createInitialCurve = useCallback(() => {
    const start = { x: canvasWidth / 2, y: topLine + 50 };
    const end = { x: canvasWidth / 2, y: bottomLine - 50 };
    const control1 = { x: start.x - 50, y: start.y + 100 };
    const control2 = { x: end.x + 50, y: end.y - 100 };
    return [{ start, control1, control2, end }];
  }, [canvasWidth, topLine, bottomLine]);

  // Reset points on height/width change
  useEffect(() => {
    setPoints(createInitialCurve());
  }, [canvasHeightInches, canvasWidthInches, createInitialCurve]);

  // Drawing function
  const draw = useCallback(() => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Draw dashed lines
    ctx.strokeStyle = "gray";
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(0, topLine + 50);
    ctx.lineTo(canvasWidth, topLine + 50);
    ctx.moveTo(0, bottomLine - 50);
    ctx.lineTo(canvasWidth, bottomLine - 50);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw bezier curves
    points.forEach((curve) => {
      ctx.strokeStyle = "black";
      ctx.beginPath();
      ctx.moveTo(curve.start.x, curve.start.y);
      ctx.bezierCurveTo(
        curve.control1.x,
        curve.control1.y,
        curve.control2.x,
        curve.control2.y,
        curve.end.x,
        curve.end.y
      );
      ctx.stroke();

      // Draw points
      [curve.start, curve.control1, curve.control2, curve.end].forEach(
        (p) => {
          ctx.fillStyle = "blue";
          ctx.beginPath();
          ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
          ctx.fill();
        }
      );
    });
  }, [points, canvasWidth, canvasHeight, topLine, bottomLine]);

  useEffect(() => {
    draw();
  }, [draw]);

  // Add new point on click
  const handleCanvasClick = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Add a simple control point for demonstration
    const newCurve = {
      start: { x, y },
      control1: { x: x - 50, y: y + 50 },
      control2: { x: x + 50, y: y + 50 },
      end: { x: x, y: y + 100 },
    };
    setPoints((prev) => [...prev, newCurve]);
  };

  // Export SVG
  const exportSVG = () => {
    let svg = `<svg width="${canvasWidth}" height="${canvasHeight}" xmlns="http://www.w3.org/2000/svg">`;
    points.forEach((curve) => {
      svg += `<path d="M ${curve.start.x} ${curve.start.y} C ${curve.control1.x} ${curve.control1.y}, ${curve.control2.x} ${curve.control2.y}, ${curve.end.x} ${curve.end.y}" stroke="black" fill="none"/>`;
    });
    svg += `</svg>`;
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "bezier_curve.svg";
    link.click();
  };

  // Reset canvas
  const resetCanvas = () => {
    setPoints(createInitialCurve());
  };

  return (
    <div style={{ textAlign: "center" }}>
      <div>
        <label>
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
        <label style={{ marginLeft: "20px" }}>
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
      </div>
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        style={{ border: "1px solid black", marginTop: "20px" }}
        onClick={handleCanvasClick}
      />
      <div style={{ marginTop: "10px" }}>
        <button onClick={resetCanvas}>Reset</button>
        <button onClick={exportSVG} style={{ marginLeft: "10px" }}>
          Export SVG
        </button>
      </div>
    </div>
  );
}
