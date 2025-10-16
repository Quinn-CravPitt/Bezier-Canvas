const { svgs } = require("./share-svg");

exports.handler = async (event) => {
  const id = event.path.replace("/view/", "");

  const svg = svgs[id];
  if (!svg) {
    return { statusCode: 404, body: "SVG not found" };
  }

  return {
    statusCode: 200,
    headers: { "Content-Type": "image/svg+xml" },
    body: svg,
  };
};
