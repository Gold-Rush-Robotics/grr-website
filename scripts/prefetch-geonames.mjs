// Pre-download the GeoNames dump used by `local-reverse-geocoder` so the
// data is present on disk at runtime (e.g. on Vercel serverless functions,
// whose filesystem is read-only). Runs as part of `pnpm build` and writes
// to `<repo>/.geonames-cache/`. The cache directory is then bundled into
// the function via `outputFileTracingIncludes` in `next.config.js`.

import path from "node:path";
import process from "node:process";

import geocoder from "local-reverse-geocoder";

const dumpDirectory =
  process.env.GEOCODER_DUMP_DIRECTORY ??
  path.join(process.cwd(), ".geonames-cache");

const INIT_TIMEOUT_MS = 5 * 60 * 1000;

console.info(
  `[prefetch-geonames] Preparing GeoNames data in ${dumpDirectory}`,
);
const start = Date.now();

const timeout = setTimeout(() => {
  console.error(
    `[prefetch-geonames] Timed out after ${INIT_TIMEOUT_MS / 1000}s`,
  );
  process.exit(1);
}, INIT_TIMEOUT_MS);

geocoder.init(
  {
    dumpDirectory,
    load: {
      admin1: true,
      admin2: false,
      admin3And4: false,
      alternateNames: false,
    },
  },
  () => {
    clearTimeout(timeout);
    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    console.info(`[prefetch-geonames] Done in ${elapsed}s`);
    process.exit(0);
  },
);
