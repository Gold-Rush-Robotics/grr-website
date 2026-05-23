/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  // Keep "local-reverse-geocoder" external so its disk cache works correctly in serverless functions
  serverExternalPackages: ["local-reverse-geocoder"],

  // Include GeoNames cache in tRPC serverless function bundle
  outputFileTracingIncludes: {
    "/api/trpc/[trpc]": ["./.geonames-cache/**/*"],
  },
};

export default config;
