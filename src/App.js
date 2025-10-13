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


        {/* Canvas section */}
        <div>
          <BezierCanvas />
        </div>
      </div>
    </div>
  );
}

export default App;
