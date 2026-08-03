import { cp, mkdir, readdir, rm } from "node:fs/promises";
import path from "node:path";

const root = new URL("../", import.meta.url);
const packagesDirectory = new URL("packages/", root);
const outputDirectory = new URL("dist/", root);

await rm(outputDirectory, { force: true, recursive: true });
await mkdir(outputDirectory, { recursive: true });

const entries = await readdir(packagesDirectory, { withFileTypes: true });

for (const entry of entries) {
  if (!entry.isDirectory()) {
    continue;
  }

  await cp(
    new URL(`packages/${entry.name}/src/`, root),
    new URL(`dist/${entry.name}/`, root),
    {
      filter: (sourcePath) => !path.basename(sourcePath).startsWith("README"),
      recursive: true,
    },
  );
}
