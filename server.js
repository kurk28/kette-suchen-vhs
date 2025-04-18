import { createServer } from "node:http";
import { stat, readFile } from "node:fs/promises";
import { resolve, join, extname, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const PORT = process.env.PORT || 6969;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PUBLIC_DIR = resolve(__dirname, "src");
console.info(`Serving files from: ${PUBLIC_DIR}`);

const MIME_TYPES = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".mjs": "application/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".txt": "text/plain",
  default: "application/octet-stream",
};

const getContentType = (filePath) => {
  const extension = extname(filePath);
  return MIME_TYPES[extension] || MIME_TYPES.default;
};

const requestHandler = async (req, res) => {
  console.info(`Request: ${req.method} ${req.url}`);

  let requestedUrl;
  try {
    requestedUrl = new URL(req.url, `http://${req.headers.host}`);
  } catch (err) {
    console.error("Invalid URL:", err.message);
    res.writeHead(400, { "Content-Type": "text/plain" });
    res.end("Bad Request: Invalid URL");
    return;
  }

  try {
    const decodedPathname = decodeURIComponent(requestedUrl.pathname);
    const baseFilePath =
      decodedPathname === "/" ? "index.html" : decodedPathname;
    const resolvedPath = resolve(PUBLIC_DIR, "." + join("/", baseFilePath));
    if (!resolvedPath.startsWith(PUBLIC_DIR)) {
      console.warn(
        `Forbidden access attempt: ${resolvedPath} (outside ${PUBLIC_DIR})`
      );
      res.writeHead(403, { "Content-Type": "text/plain" });
      res.end("403 Forbidden");
      return;
    }

    let stats;
    try {
      stats = await stat(resolvedPath); // Use promise-based stat
    } catch (err) {
      if (err.code === "ENOENT") {
        console.warn(`File not found: ${resolvedPath}`);
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("404 Not Found");
      } else {
        console.error(`Error accessing path ${resolvedPath}:`, err);
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("500 Internal Server Error");
      }
      return;
    }

    if (!stats.isFile()) {
      console.warn(`Attempt to access non-file: ${resolvedPath}`);
      res.writeHead(403, { "Content-Type": "text/plain" });
      res.end("403 Forbidden: Not a file");
      return;
    }

    const contentType = getContentType(resolvedPath);

    try {
      const content = await readFile(resolvedPath);
      res.writeHead(200, {
        "Content-Type": contentType,
        "Content-Length": stats.size,
      });
      res.end(content);
    } catch (err) {
      console.error(`Error reading file ${resolvedPath}:`, err);
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("500 Internal Server Error");
    }
  } catch (err) {
    console.error("Error processing request:", err);
    res.writeHead(500, { "Content-Type": "text/plain" });
    res.end("500 Internal Server Error");
  }
};

const server = createServer(requestHandler);

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`Error: Port ${PORT} is already in use.`);
  } else {
    console.error("Server error:", err);
  }
  process.exit(1);
});
