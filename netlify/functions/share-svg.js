const crypto = require("crypto");

// In-memory store (temporary, resets on deploy)
const svgs = {};

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: "Method Not Allowed" };
    }

    const { svg } = JSON.parse(event.body);
    if (!svg) return { statusCode: 400, body: "Missing SVG" };

    // Generate a unique ID
    const id = crypto.randomBytes(6).toString("hex");

    // Store SVG in memory (can also store in DB or KV store)
    svgs[id] = svg;

    // Respond with a shareable URL
    return {
      statusCode: 200,
      body: JSON.stringify({ url: `/view/${id}` }),
    };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: "Internal Server Error" };
  }
};

// Optional: Export the in-memory SVGs for /view/:id function
exports.svgs = svgs;
