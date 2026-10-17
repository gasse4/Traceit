// Starts the real backend on a throwaway database + uploads folder for browser tests.
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const backend = resolve(import.meta.dirname, "../../backend");
const python = join(backend, ".venv", process.platform === "win32" ? "Scripts/python.exe" : "bin/python");
const data = mkdtempSync(join(tmpdir(), "traceit-e2e-"));

const server = spawn(python, ["-m", "uvicorn", "app:app", "--port", process.env.E2E_API_PORT], {
  cwd: backend,
  stdio: "inherit",
  env: { ...process.env, TRACEIT_DB: join(data, "e2e.db"), TRACEIT_UPLOADS: join(data, "uploads") },
});

const cleanup = () => {
  server.kill();
  rmSync(data, { recursive: true, force: true });
};
process.on("SIGTERM", cleanup);
process.on("SIGINT", cleanup);
server.on("exit", (code) => process.exit(code ?? 0));
