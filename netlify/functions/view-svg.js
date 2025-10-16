import { promises as fs } from "fs";
import path from "path";

export const handler = async (event) => {
  try {
    const { id } = event.queryStringParameters;

    if (!id) {
      return {
        statusCode: 400,
        body: "Missing SVG id",
      };
    }

    const svgPath = path.join("/tmp", `${id}.svg`);

    // If file doesn’t exist in /tmp, you could later fetch from database or S3
    try {
      const svgContent = await fs.readFile(svgPath, "utf8");

      return {
        statusCode: 200,
        headers: {
          "Content-Type": "image/svg+xml",
        },
        body: svgContent,
      };
    } catch (err) {
      return {
        statusCode: 404,
        body: "SVG not found",
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: `Server error: ${error.message}`,
    };
  }
};
