import React from "react";
import BezierCanvas from "./BezierCanvas";

function App() {
  return <BezierCanvas />;
}
<div style={{ marginTop: 20, textAlign: "center" }}>
  <h3>How to Use This App</h3>
  <div style={{ maxWidth: 560, margin: "0 auto" }}>
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
</div>

export default App;
