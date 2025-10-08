// src/BezierCanvas.js
import React, { useState, useRef, useEffect, useCallback } from "react";

const INCH_TO_PX = 96; // 1 inch = 96px

export default function BezierCanvas() {
  const canvasRef = useRef(null);
  const [canvasHeightInches, setCanvasHeightInches] = useState(8);
  const [canvasWidthInches, setCanvasWidthInches] = useState(3);
  const [points, setPoints] = useState([]);
  const [dragging, setDragging] = useState(null);

  const canvasHeight = canvasHeightInches * INCH_TO_PX;
  const canvasWidth = canvasWidthInches * INCH_TO_PX;

  const topLine = 0;
  const bottomLine = canvasHeight;

  // Initialize curve with one segment
  const createInitialCurve = useCallback(() => {
    const start = {
      x: canvasWidth / 2,
      y: topLine + 50,
      cp1: { x: canvasWidth / 2 - 50, y: topLine + 150 },
      cp2: { x: canvasWidth / 2 + 50, y: bottomLine - 150 },
    };
    const end = {
      x: canvasWidth / 2,
      y: bottomLine - 50,
      cp1: { x: canvasWidth / 2 - 50, y: bottomLine - 150 },
      cp2: { x: canvasWidth / 2 + 50, y: bottomLine - 50 },
    };
    return [start, end];
  }, [canvasWidth, topLine, bottomLine]);

  useEffect(() => {
    setPoints(createInitialCurve());
  }, [canvasHeightInches, canvasWidthInches, createInitialCurve]);

  // Draw canvas
  const draw = useCallback(() => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Draw top/bottom dashed lines
    ctx.strokeStyle = "gray";
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(0, topLine + 50);
    ctx.lineTo(canvasWidth, topLine + 50);
    ctx.moveTo(0, bottomLine - 50);
    ctx.lineTo(canvasWidth, bottomLine - 50);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw Bezier curve
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.beginPath();
    points.forEach((p, i) => {
      if (i === 0) {
        ctx.moveTo(p.x, p.y);
      } else {
        const prev = points[i - 1];
        ctx.bezierCurveTo(
          prev.cp2.x,
          prev.cp2.y,
          p.cp1.x,
          p.cp1.y,
          p.x,
          p.y
        );
      }
    });
    ctx.stroke();

    // Draw connecting lines to handles and points
    points.forEach((p) => {
      ctx.strokeStyle = "lightgray";
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.cp1.x, p.cp1.y);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.cp2.x, p.cp2.y);
      ctx.stroke();
    });

    // Draw anchor points
    points.forEach((p) => {
      ctx.fillStyle = "blue";
      ctx.beginPath();
      ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
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

  useEffect(() => {
    draw();
  }, [draw]);

  const getMousePos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handleMouseDown = (e) => {
    const { x, y } = getMousePos(e);
    points.forEach((p, i) => {
      const handles = ["x", "y"];
      // check anchor
      if (Math.hypot(p.x - x, p.y - y) < 6) {
        setDragging({ pointIndex: i, type: "anchor" });
      }
      // check cp1
      if (Math.hypot(p.cp1.x - x, p.cp1.y - y) < 4) {
        setDragging({ pointIndex: i, type: "cp1" });
      }
      // check cp2
      if (Math.hypot(p.cp2.x - x, p.cp2.y - y) < 4) {
        setDragging({ pointIndex: i, type: "cp2" });
      }
    });
  };

  const handleMouseMove = (e) => {
    if (!dragging) return;
    const { x, y } = getMousePos(e);
    setPoints((prev) => {
      const updated = [...prev];
      const p = updated[dragging.pointIndex];
      if (dragging.type === "anchor") p.x = x, p.y = y;
      if (dragging.type === "cp1") p.cp1.x = x, p.cp1.y = y;
      if (dragging.type === "cp2") p.cp2.x = x, p.cp2.y = y;
      return updated;
    });
  };

  const handleMouseUp = () => {
    setDragging(null);
  };

  // Insert new point on curve
  const handleCanvasClick = (e) => {
    const { x, y } = getMousePos(e);
    // find nearest segment
    let minDist = Infinity;
    let insertIndex = 1;
    for (let i = 1; i < points.length; i++) {
      const midX = (points[i - 1].x + points[i].x) / 2;
      const midY = (points[i - 1].y + points[i].y) / 2;
      const dist = Math.hypot(midX - x, midY - y);
      if (dist < minDist) {
        minDist = dist;
        insertIndex = i;
      }
    }
    const prev = points[insertIndex - 1];
    const next = points[insertIndex];
    const newPoint = {
      x,
      y,
      cp1: { x: x - 30, y: y },
      cp2: { x: x + 30, y: y },
    };
    setPoints((prevPoints) => {
      const updated = [...prevPoints];
      updated.splice(insertIndex, 0, newPoint);
      return updated;
    });
  };

  const resetCanvas = () => setPoints(createInitialCurve());

  const exportSVG = () => {
    let svg = `<svg width="${canvasWidth}" height="${canvasHeight}" xmlns="http://www.w3.org/2000/svg">`;
    points.forEach((p, i) => {
      if (i === 0) return;
      const prev = points[i - 1];
      svg += `<path d="M ${prev.x} ${prev.y} C ${prev.cp2.x} ${prev.cp2.y}, ${p.cp1.x} ${p.cp1.y}, ${p.x} ${p.y}" stroke="black" fill="none"/>`;
    });
    svg += `</svg>`;
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "bezier_curve.svg";
    link.click();
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
        style={{
          border: "1px solid black",
          marginTop: "20px",
          cursor: "pointer",
        }}
        onClick={handleCanvasClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
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
