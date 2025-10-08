import React from "react";
import BezierCanvas from "./BezierCanvas";

function App() {
  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ textAlign: "center" }}>Bezier Curve Drawer</h2>

      {/* Flex container for canvas + video */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          gap: "20px", // space between canvas and video
          flexWrap: "wrap", // allows stacking on smaller screens
        }}
      >
        {/* Video section */}
        <div style={{ flex: "0 0 560px" }}>
          <h3 style={{ textAlign: "center" }}>How to Use This App</h3>
          <iframe
            width="100%"
            height="315"
            src="https://www.youtube.com/embed/MpOIOfbsSao?si=CZrekRUTKNT578QM"
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          ></iframe>
        </div>

        {/* Canvas section */}
        <div>
          <BezierCanvas />
        </div>
      </div>
    </div>
  );
}

export default App;
