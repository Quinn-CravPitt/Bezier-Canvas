import { promises as fs } from "fs";
import path from "path";

export const handler = async (event) => {
  try {
    const { id, svgContent } = JSON.parse(event.body);

    if (!id || !svgContent) {
      return { statusCode: 400, body: "Missing id or svgContent" };
    }

    const filePath = path.join("/tmp", `${id}.svg`);
    await fs.writeFile(filePath, svgContent, "utf8");

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    };
  } catch (err) {
    return { statusCode: 500, body: `Error: ${err.message}` };
  }
};
