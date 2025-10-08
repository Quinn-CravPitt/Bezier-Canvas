import React from "react";
import BezierCanvas from "./BezierCanvas";
import "./App.css"; // import our CSS file

function App() {
  return (
    <div className="app-container">
      <header>
        <h1>Bezier Curve Drawer</h1>
        <p>Create and edit Bézier curves, then export them as SVG!</p>
      </header>

      <div className="main-content">
        {/* Video Card */}
        <div className="card video-card">
          <h2>How to Use This App</h2>
          <iframe
            src="https://www.youtube.com/embed/MpOIOfbsSao?si=CZrekRUTKNT578QM"
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          ></iframe>
        </div>

        {/* Canvas Card */}
        <div className="card canvas-card">
          <BezierCanvas />
        </div>
      </div>

      <footer>
        <p>Made with ❤️ using React</p>
      </footer>
    </div>
  );
}

export default App;
