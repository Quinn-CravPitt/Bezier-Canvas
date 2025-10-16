import React, { useState, useRef, useEffect, useCallback } from "react";
/* eslint-disable react-hooks/exhaustive-deps */

const PIXELS_PER_INCH = 96;
const SAMPLE_POINTS = 200;

export default function BezierCanvas() {
  const [canvasHeightInches, setCanvasHeightInches] = useState(8);
  const [canvasWidthInches, setCanvasWidthInches] = useState(3);
  const [prevCanvasSize, setPrevCanvasSize] = useState({
    width: 3 * PIXELS_PER_INCH,
    height: 8 * PIXELS_PER_INCH,
  });
  const canvasRef = useRef(null);
  const [anchors, setAnchors] = useState([]);
  const [dragging, setDragging] = useState(null);
  const [tool, setTool] = useState("add"); // "add" | "delete"

  const canvasWidth = canvasWidthInches * PIXELS_PER_INCH;
  const canvasHeight = canvasHeightInches * PIXELS_PER_INCH;
  const topLine = 0;
  const bottomLine = canvasHeight;

  // Initialize straight vertical anchors
  const createInitialAnchors = useCallback(() => {
    const midX = canvasWidth / 2;
    const start = {
      x: midX,
      y: topLine,
      isEnd: true,
      lockY: true,
      cp2: { x: midX, y: topLine + 100 },
    };
    const end = {
      x: midX,
      y: bottomLine,
      isEnd: true,
      lockY: true,
      cp1: { x: midX, y: bottomLine - 100 },
    };
    return [start, end];
  }, [canvasWidth, canvasHeight, topLine, bottomLine]);

  useEffect(() => {
    setAnchors(createInitialAnchors());
    setPrevCanvasSize({ width: canvasWidth, height: canvasHeight });
  }, [createInitialAnchors]);

  // Scale anchors when canvas is resized
  const scaleAnchors = (newWidth, newHeight) => {
    const scaleX = newWidth / prevCanvasSize.width;
    const scaleY = newHeight / prevCanvasSize.height;
    setAnchors((prev) =>
      prev.map((a) => ({
        ...a,
        x: a.x * scaleX,
        y: a.y * scaleY,
        cp1: a.cp1 ? { x: a.cp1.x * scaleX, y: a.cp1.y * scaleY } : null,
        cp2: a.cp2 ? { x: a.cp2.x * scaleX, y: a.cp2.y * scaleY } : null,
      }))
    );
    setPrevCanvasSize({ width: newWidth, height: newHeight });
  };

  // Cubic Bézier evaluation
  const bezierPoint = (t, A, B) => {
    const u = 1 - t;
    return {
      x:
        u ** 3 * A.x +
        3 * u ** 2 * t * A.cp2.x +
        3 * u * t ** 2 * B.cp1.x +
        t ** 3 * B.x,
      y:
        u ** 3 * A.y +
        3 * u ** 2 * t * A.cp2.y +
        3 * u * t ** 2 * B.cp1.y +
        t ** 3 * B.y,
    };
  };

  const bezierSamples = useCallback((A, B) => {
    const samples = [];
    for (let s = 0; s <= SAMPLE_POINTS; s++) {
      samples.push(bezierPoint(s / SAMPLE_POINTS, A, B));
    }
    return samples;
  }, []);

  // Draw loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = Math.round(canvasWidth);
    canvas.height = Math.round(canvasHeight);
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Brown fill
    if (anchors.length >= 2) {
      const fullSamples = [];
      for (let i = 0; i < anchors.length - 1; i++)
        fullSamples.push(...bezierSamples(anchors[i], anchors[i + 1]));
      ctx.beginPath();
      ctx.moveTo(0, 0);
      fullSamples.forEach((pt) => ctx.lineTo(pt.x, pt.y));
      ctx.lineTo(0, canvasHeight);
      ctx.closePath();
      ctx.fillStyle = "#8B4513";
      ctx.fill();
    }

    // Guides
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = "#999";
    ctx.beginPath();
    ctx.moveTo(0, topLine);
    ctx.lineTo(canvasWidth, topLine);
    ctx.moveTo(0, bottomLine);
    ctx.lineTo(canvasWidth, bottomLine);
    ctx.stroke();
    ctx.setLineDash([]);

    const centerX = canvasWidth / 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(centerX, topLine);
    ctx.lineTo(centerX, bottomLine);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.font = "16px Arial";
    ctx.fillStyle = "#111";
    ctx.fillText(
      `${canvasWidthInches.toFixed(2)} in`,
      canvasWidth - 70,
      topLine + 18
    );
    ctx.fillText(
      `${canvasHeightInches.toFixed(2)} in`,
      centerX + 6,
      canvasHeight / 2
    );

    // Draw curve & handles
    if (anchors.length >= 2) {
      ctx.beginPath();
      ctx.moveTo(anchors[0].x, anchors[0].y);
      for (let i = 0; i < anchors.length - 1; i++) {
        const A = anchors[i],
          B = anchors[i + 1];
        ctx.bezierCurveTo(A.cp2.x, A.cp2.y, B.cp1.x, B.cp1.y, B.x, B.y);
      }
      ctx.strokeStyle = "blue";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.lineWidth = 1;
      ctx.strokeStyle = "#999";
      anchors.forEach((a, i) => {
        if (a.cp1 && i !== 0) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(a.cp1.x, a.cp1.y);
          ctx.stroke();
        }
        if (a.cp2 && i !== anchors.length - 1) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(a.cp2.x, a.cp2.y);
          ctx.stroke();
        }
        ctx.fillStyle = "black";
        ctx.beginPath();
        ctx.arc(a.x, a.y, 6, 0, Math.PI * 2);
        ctx.fill();
        if (a.cp1 && i !== 0) {
          ctx.fillStyle = "red";
          ctx.beginPath();
          ctx.arc(a.cp1.x, a.cp1.y, 4, 0, Math.PI * 2);
          ctx.fill();
        }
        if (a.cp2 && i !== anchors.length - 1) {
          ctx.fillStyle = "red";
          ctx.beginPath();
          ctx.arc(a.cp2.x, a.cp2.y, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    }
  }, [
    anchors,
    canvasWidth,
    canvasHeight,
    canvasWidthInches,
    canvasHeightInches,
    bezierSamples,
    topLine,
    bottomLine,
  ]);

  // Hit test for curve
  function hitTestCurve(x, y, threshold = 8) {
    if (anchors.length < 2) return null;
    let best = { segIndex: -1, dist: Infinity };
    for (let i = 0; i < anchors.length - 1; i++) {
      const samples = bezierSamples(anchors[i], anchors[i + 1]);
      for (let pt of samples) {
        const d = Math.hypot(pt.x - x, pt.y - y);
        if (d < best.dist) best = { segIndex: i, dist: d };
      }
    }
    return best.dist <= threshold ? best : null;
  }

  // Mouse events
  const handleMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Delete mode
    if (tool === "delete") {
      for (let i = 1; i < anchors.length - 1; i++) {
        // cannot delete first or last
        const a = anchors[i];
        if (Math.hypot(a.x - x, a.y - y) < 10) {
          setAnchors((prev) => {
            const next = prev.slice();
            next.splice(i, 1);
            return next;
          });
          return;
        }
      }
      return;
    }

    // Check for dragging
    for (let i = 0; i < anchors.length; i++) {
      const a = anchors[i];
      if (Math.hypot(a.x - x, a.y - y) < 8) {
        setDragging({ type: "anchor", index: i });
        return;
      }
      if (a.cp1 && Math.hypot(a.cp1.x - x, a.cp1.y - y) < 6) {
        setDragging({ type: "cp1", index: i });
        return;
      }
      if (a.cp2 && Math.hypot(a.cp2.x - x, a.cp2.y - y) < 6) {
        setDragging({ type: "cp2", index: i });
        return;
      }
    }

    // Add point
    const hit = hitTestCurve(x, y, 10);
    if (hit) {
      const insertAt = hit.segIndex + 1;
      const newAnchor = { x, y, cp1: { x: x - 40, y }, cp2: { x: x + 40, y } };
      const nextAnchors = [...anchors];
      nextAnchors.splice(insertAt, 0, newAnchor);
      setAnchors(nextAnchors);
      setDragging({ type: "anchor", index: insertAt });
    }
  };

  const handleMouseMove = (e) => {
    if (!dragging) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setAnchors((prev) => {
      const next = prev.map((a) => ({
        ...a,
        cp1: a.cp1 ? { ...a.cp1 } : null,
        cp2: a.cp2 ? { ...a.cp2 } : null,
      }));
      const a = next[dragging.index];
      if (!a) return prev;
      if (dragging.type === "anchor") {
        a.x = x;
        if (!a.lockY) a.y = y;
      } else if (dragging.type === "cp1") {
        a.cp1.x = x;
        a.cp1.y = y;
      } else if (dragging.type === "cp2") {
        a.cp2.x = x;
        a.cp2.y = y;
      }
      return next;
    });
  };

  const handleMouseUp = () => setDragging(null);
  const handleReset = () => setAnchors(createInitialAnchors());

  // Check for self-intersections
  function segmentsIntersect(p1, p2, q1, q2) {
    const det = (p2.x - p1.x) * (q2.y - q1.y) - (p2.y - p1.y) * (q2.x - q1.x);
    if (det === 0) return false;
    const lambda =
      ((q2.y - q1.y) * (q2.x - p1.x) + (q1.x - q2.x) * (q2.y - p1.y)) / det;
    const gamma =
      ((p1.y - p2.y) * (q2.x - p1.x) + (p2.x - p1.x) * (q2.y - p1.y)) / det;
    return 0 < lambda && lambda < 1 && 0 < gamma && gamma < 1;
  }

  function curveSelfIntersects(anchors) {
    if (anchors.length < 2) return false;
    const allPoints = [];
    for (let i = 0; i < anchors.length - 1; i++)
      allPoints.push(...bezierSamples(anchors[i], anchors[i + 1]));
    for (let i = 0; i < allPoints.length - 1; i++) {
      for (let j = i + 2; j < allPoints.length - 1; j++) {
        if (
          segmentsIntersect(
            allPoints[i],
            allPoints[i + 1],
            allPoints[j],
            allPoints[j + 1]
          )
        )
          return true;
      }
    }
    return false;
  }

  const exportSVG = () => {
    if (curveSelfIntersects(anchors)) {
      alert("Cannot export: Curve intersects itself!");
      return;
    }
    if (anchors.length < 2) return;

    // Sample all points to find the true leftmost x of the curve
    const allPoints = [];
    for (let i = 0; i < anchors.length - 1; i++) {
      allPoints.push(...bezierSamples(anchors[i], anchors[i + 1]));
    }
    const minX = Math.min(...allPoints.map((p) => p.x));

    // Shift all curve points right by 1 inch from the leftmost curve point
    const offset = PIXELS_PER_INCH;
    const deltaX = offset - minX; // how much to shift right

    // Start building SVG path
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${canvasWidth}" height="${canvasHeight}">\n`;
    svg += `<path d="`;

    // Vertical line at 1 inch left of the curve
    svg += `M ${0} ${canvasHeight} L ${0} 0 `;

    // Connect to top of curve (shifted)
    svg += `L ${anchors[0].x + deltaX} ${anchors[0].y} `;

    // Bézier curve itself (all points shifted)
    for (let i = 0; i < anchors.length - 1; i++) {
      const A = anchors[i],
        B = anchors[i + 1];
      svg += `C ${A.cp2.x + deltaX} ${A.cp2.y}, ${B.cp1.x + deltaX} ${
        B.cp1.y
      }, ${B.x + deltaX} ${B.y} `;
    }

    // Connect to bottom of curve
    svg += `L ${anchors[anchors.length - 1].x + deltaX} ${
      anchors[anchors.length - 1].y
    } `;

    // Close polygon back to bottom-left
    svg += `L 0 ${canvasHeight} Z" `;

    svg += `stroke="blue" fill="none" stroke-width="2"/>\n</svg>`;

    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "bezier_curve_polygon.svg";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  // --- New Function ---
  const shareSVG = async () => {
    if (anchors.length < 2) return;

    // Generate the same SVG string as exportSVG
    const allPoints = [];
    for (let i = 0; i < anchors.length - 1; i++) {
      allPoints.push(...bezierSamples(anchors[i], anchors[i + 1]));
    }
    const minX = Math.min(...allPoints.map((p) => p.x));
    const offset = PIXELS_PER_INCH;
    const deltaX = offset - minX;

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${canvasWidth}" height="${canvasHeight}">\n`;
    svg += `<path d="M 0 ${canvasHeight} L 0 0 L ${anchors[0].x + deltaX} ${
      anchors[0].y
    } `;
    for (let i = 0; i < anchors.length - 1; i++) {
      const A = anchors[i],
        B = anchors[i + 1];
      svg += `C ${A.cp2.x + deltaX} ${A.cp2.y}, ${B.cp1.x + deltaX} ${
        B.cp1.y
      }, ${B.x + deltaX} ${B.y} `;
    }
    svg += `L ${anchors[anchors.length - 1].x + deltaX} ${
      anchors[anchors.length - 1].y
    } L 0 ${canvasHeight} Z" stroke="blue" fill="none" stroke-width="2"/>\n</svg>`;

    try {
      const response = await fetch("/.netlify/functions/save-svg", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ svg }),
      });
      const data = await response.json();

      if (data.url) {
        window.open(data.url, "_blank"); // open the share link in new tab
      } else {
        alert("Failed to generate share link.");
      }
    } catch (err) {
      console.error(err);
      alert("Error sharing SVG");
    }
  };

  return (
    <div
      style={{
        textAlign: "center",
        padding: 24,
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h2>Bezier Curve Drawer</h2>

      <div style={{ marginBottom: 10 }}>
        <label>Height (in): </label>
        <input
          type="range"
          min="1"
          max="8"
          step="0.1"
          value={canvasHeightInches}
          onChange={(e) => {
            const h = parseFloat(e.target.value);
            setCanvasHeightInches(h);
            scaleAnchors(canvasWidth, h * PIXELS_PER_INCH);
          }}
        />
        <span style={{ marginLeft: 8 }}>
          {canvasHeightInches.toFixed(1)} in
        </span>
      </div>

      <div style={{ marginBottom: 10 }}>
        <label>Width (in): </label>
        <input
          type="range"
          min="1"
          max="7"
          step="0.1"
          value={canvasWidthInches}
          onChange={(e) => {
            const w = parseFloat(e.target.value);
            setCanvasWidthInches(w);
            scaleAnchors(w * PIXELS_PER_INCH, canvasHeight);
          }}
        />
        <span style={{ marginLeft: 8 }}>{canvasWidthInches.toFixed(1)} in</span>
      </div>

      <canvas
        ref={canvasRef}
        style={{
          border: "1px solid #ccc",
          background: "#fff",
          borderRadius: 10,
          boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
          cursor: dragging ? "grabbing" : "crosshair",
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />

      <div style={{ marginTop: 12 }}>
        <button onClick={handleReset} style={buttonStyle("#007bff")}>
          Reset Curve
        </button>
        <button
          onClick={exportSVG}
          style={{ ...buttonStyle("#28a745"), marginLeft: 10 }}
        >
          Export SVG
        </button>
        <button
          onClick={() => setTool(tool === "delete" ? "add" : "delete")}
          style={{
            ...buttonStyle(tool === "delete" ? "#d32f2f" : "#666"),
            marginLeft: 10,
          }}
        >
          {tool === "delete" ? "Exit Delete" : "Delete Point"}
        </button>
        <button
  onClick={shareSVG}
  style={{ ...buttonStyle("#6f42c1"), marginLeft: 10 }}
>
  Share SVG
</button>

      </div>

      <div style={{ marginTop: 12, fontWeight: "bold" }}>
        Active Tool: {tool === "delete" ? "Delete" : "Add / Edit"}
      </div>

      <div
        style={{
          marginTop: 36,
          maxWidth: 700,
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        <h3>How to Use This App</h3>
        <div
          style={{
            borderRadius: 10,
            overflow: "hidden",
            boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
          }}
        >
          <iframe
            width="100%"
            height="360"
            src="https://www.youtube.com/embed/MpOIOfbsSao?si=w4G7JN4rnNT3t44C"
            title="YouTube video"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}

const buttonStyle = (bg) => ({
  padding: "8px 16px",
  borderRadius: 6,
  background: bg,
  color: "white",
  border: "none",
  cursor: "pointer",
});
