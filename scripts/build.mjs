import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const outDir = path.join(root, "public");

const files = ["index.html", "styles.css", "script.js"];
const directories = ["assets"];

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

for (const file of files) {
  fs.copyFileSync(path.join(root, file), path.join(outDir, file));
}

for (const directory of directories) {
  fs.cpSync(path.join(root, directory), path.join(outDir, directory), {
    recursive: true,
  });
}

console.log("Static site built in public/");
