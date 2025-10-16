export const handler = async (event) => {
  const base64 = event.queryStringParameters?.data;
  if (!base64) {
    return { statusCode: 400, body: "No SVG data provided" };
  }

  const svg = decodeURIComponent(escape(atob(base64)));

  return {
    statusCode: 200,
    headers: { "Content-Type": "image/svg+xml" },
    body: svg,
  };
};
