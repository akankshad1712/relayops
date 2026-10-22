import "dotenv/config";
import { app } from "./app.js";
import { env } from "./lib/env.js";
const server = app.listen(env.API_PORT, () => console.log(`RelayOps API listening on :${env.API_PORT}`));
function shutdown(signal: string) {
  console.log(`${signal} received; shutting down`);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10_000).unref();
}
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
