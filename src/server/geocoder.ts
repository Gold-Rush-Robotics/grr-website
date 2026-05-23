import "server-only";

import path from "node:path";

import geocoder, {
  type AddressObject,
  type InitOptions,
} from "local-reverse-geocoder";

const DUMP_DIRECTORY =
  process.env.GEOCODER_DUMP_DIRECTORY ??
  path.join(process.cwd(), ".geonames-cache");

const INIT_OPTIONS: InitOptions = {
  dumpDirectory: DUMP_DIRECTORY,
  load: {
    admin1: true,
    admin2: false,
    admin3And4: false,
    alternateNames: false,
  },
};

let initPromise: Promise<void> | null = null;

function ensureInitialized(): Promise<void> {
  if (initPromise) return initPromise;

  const pending = new Promise<void>((resolve, reject) => {
    try {
      geocoder.init(INIT_OPTIONS, () => resolve());
    } catch (err) {
      reject(err instanceof Error ? err : new Error(String(err)));
    }
  });

  // Don't poison future calls with a permanently-rejected promise.
  pending.catch(() => {
    if (initPromise === pending) initPromise = null;
  });

  initPromise = pending;
  return pending;
}

type LookUpCallback = (
  err: Error | null,
  addresses?: AddressObject[][],
) => void;

function lookUpClosest(
  lat: number,
  lon: number,
): Promise<AddressObject | null> {
  return new Promise((resolve, reject) => {
    const callback: LookUpCallback = (err, addresses) => {
      if (err) {
        reject(err);
        return;
      }
      const first = addresses?.[0]?.[0];
      resolve(first ?? null);
    };
    geocoder.lookUp(
      { latitude: lat, longitude: lon },
      1,
      callback as Parameters<typeof geocoder.lookUp>[2],
    );
  });
}

function formatAddress(addr: AddressObject): string {
  const parts: string[] = [];

  if (addr.name) parts.push(addr.name);

  const region = addr.admin1Code?.name;
  if (region && region !== addr.name) parts.push(region);

  if (addr.countryCode && addr.countryCode !== "US") {
    parts.push(addr.countryCode);
  }

  return parts.join(", ");
}

export async function reverseGeocode(
  lat: number,
  lon: number,
): Promise<string | null> {
  try {
    await ensureInitialized();
    const result = await lookUpClosest(lat, lon);
    if (!result) return null;
    const formatted = formatAddress(result);
    return formatted.length > 0 ? formatted : null;
  } catch (err) {
    console.error("[geocoder] reverseGeocode failed", err);
    return null;
  }
}
