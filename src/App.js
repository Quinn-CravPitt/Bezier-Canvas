import React from "react";
import BezierCanvas from "./BezierCanvas";

function App() {
  return (
    <div style={{ padding: 20 }}>
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

      {/* Instructions box below the canvas */}
      <div
        style={{
          marginTop: 24,
          padding: 16,
          border: "1px solid #ccc",
          borderRadius: 8,
          background: "#f9f9f9",
          maxWidth: 700,
          marginLeft: "auto",
          marginRight: "auto",
          textAlign: "left",
          lineHeight: 1.6,
          fontSize: 14,
        }}
      >
        <strong>How to Get Your Custom Rib:</strong>
        <ol style={{ paddingLeft: 20, marginTop: 8 }}>
          <li>
            Order a rib on my Etsy{" "}
            <a
              href="https://www.etsy.com/listing/4383632297/customizable-pottery-rib-tool-ceramic?ref=shop_home_feat_1&logging_key=565b0d82b5038920cef0eba2883ad2da146dbf24%3A4383632297"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#007bff", textDecoration: "underline" }}
            >
              here
            </a>
            .
          </li>
          <li>
            Go to{" "}
            <a
              href="https://custompotteryrib.netlify.app/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#007bff", textDecoration: "underline" }}
            >
              https://custompotteryrib.netlify.app/
            </a>
          </li>
          <li>
            Design your pottery rib, and then press Export SVG at the bottom of
            the canvas.
          </li>
          <li>
            Send the .svg file to <strong>quinncp@icloud.com</strong>. Make sure
            the email subject line is the name you ordered under on Etsy so I
            know whose file is whose. Otherwise, I won't be able to send you the
            right profile.
          </li>
        </ol>
        <p>
          The profile you create on the app will be extruded 0.25 inches, and a
          chamfer will be added to the profile edge so it is better at cutting
          clay.
        </p>
        <p>
          If you have any other questions please feel free to reach out to me,
          thanks!
        </p>
      </div>
    </div>
  );
}

export default App;
