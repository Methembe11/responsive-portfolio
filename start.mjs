import { spawn, exec } from "node:child_process";
import net from "node:net";

function isPortFree(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once("error", () => resolve(false));
    server.listen(port, "127.0.0.1", () => {
      server.close(() => resolve(true));
    });
  });
}

async function findFreePort(start) {
  let port = start;
  while (!(await isPortFree(port))) port++;
  return port;
}

const port = await findFreePort(3000);
const url = `http://localhost:${port}`;

const openBrowser = () => {
  const cmd =
    process.platform === "win32"
      ? `start "" "${url}"`
      : process.platform === "darwin"
        ? `open "${url}"`
        : `xdg-open "${url}"`;
  exec(cmd, (err) => {
    if (err) console.error("Could not open browser:", err.message);
  });
};

setTimeout(openBrowser, 3000);

const child = spawn("vercel", ["dev", "--listen", String(port)], {
  stdio: "inherit",
  shell: process.platform === "win32",
});

child.on("close", (code) => process.exit(code ?? 0));
