import mongoose from "mongoose";
import dotenv from "dotenv";
import Project from "../models/project";

dotenv.config();

type CoordinatePair = {
  latitude: number;
  longitude: number;
};

type GeoPoint = {
  type: "Point";
  coordinates: [number, number];
};

const parseNumber = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const getLegacyCoordinates = (distance: any): CoordinatePair | null => {
  const coords = distance?.coordinates;
  if (coords) {
    const latitude = parseNumber(coords.latitude ?? coords.lat);
    const longitude = parseNumber(coords.longitude ?? coords.lng);
    if (latitude !== null && longitude !== null) {
      return { latitude, longitude };
    }
  }
  return null;
};

const hasLegacyCoordinates = (distance: any) =>
  Object.prototype.hasOwnProperty.call(distance || {}, "coordinates");

const buildLocation = (coords: CoordinatePair): GeoPoint => ({
  type: "Point",
  coordinates: [coords.longitude, coords.latitude],
});

const hasValidLocation = (distance: any) => {
  const location = distance?.location;
  if (!location || location.type !== "Point") return false;
  if (!Array.isArray(location.coordinates) || location.coordinates.length !== 2) {
    return false;
  }
  const longitude = parseNumber(location.coordinates[0]);
  const latitude = parseNumber(location.coordinates[1]);
  return longitude !== null && latitude !== null;
};

const getLocationCoordinates = (distance: any): [number, number] | null => {
  const location = distance?.location;
  if (!location || location.type !== "Point") return null;
  const coords = location.coordinates;
  if (!Array.isArray(coords) || coords.length !== 2) return null;
  const longitude = parseNumber(coords[0]);
  const latitude = parseNumber(coords[1]);
  if (longitude === null || latitude === null) return null;
  return [longitude, latitude];
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const geocodeAddress = async (address: string, apiKey: string) => {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Google Maps API error: ${response.status}`);
  }
  const data = await response.json();
  if (data.status !== "OK" || !Array.isArray(data.results) || data.results.length === 0) {
    return null;
  }
  const location = data.results[0]?.geometry?.location;
  const latitude = parseNumber(location?.lat);
  const longitude = parseNumber(location?.lng);
  if (latitude === null || longitude === null) {
    return null;
  }
  return { latitude, longitude };
};

async function backfillProjectGeo() {
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error("MONGO_URI or MONGODB_URI not found in environment variables");
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY || "";
  const dryRun = false;
  const geocodeDelayMs = 200;
  const logEvery = 100;

  await mongoose.connect(mongoUri);
  console.log("Connected to MongoDB");
  console.log("Geocoding enabled:", Boolean(apiKey));
  console.log("Dry run:", dryRun);
  console.log("Geocode delay (ms):", geocodeDelayMs);

  let scanned = 0;
  let updated = 0;
  let geocoded = 0;
  let fromLegacyCoords = 0;
  let removedLegacyCoords = 0;
  let alreadyHasLocation = 0;
  let skipped = 0;
  let skippedMissingAddress = 0;
  let skippedMissingKey = 0;
  let skippedGeocodeFailed = 0;
  let skippedNoChange = 0;
  let errors = 0;

  const cursor = Project.find({ "distance.address": { $exists: true, $ne: "" } })
    .lean()
    .cursor();

  for await (const project of cursor) {
    scanned += 1;
    try {
      const distance = project.distance || {};
      const address = typeof distance.address === "string" ? distance.address.trim() : "";
      const legacyCoords = getLegacyCoordinates(distance);
      const hasCoordinates = hasLegacyCoordinates(distance);
      const locationCoords = getLocationCoordinates(distance);
      const hasLocation = locationCoords !== null && hasValidLocation(distance);
      if (hasLocation) {
        alreadyHasLocation += 1;
      }

      let nextLocation: GeoPoint | null = locationCoords
        ? { type: "Point", coordinates: locationCoords }
        : null;

      if (!nextLocation && legacyCoords) {
        nextLocation = buildLocation(legacyCoords);
        fromLegacyCoords += 1;
      }

      if (!nextLocation) {
        if (!address) {
          skippedMissingAddress += 1;
          skipped += 1;
          continue;
        }
        if (!apiKey) {
          console.warn(`Missing GOOGLE_MAPS_API_KEY, skipping project ${project._id}`);
          skippedMissingKey += 1;
          skipped += 1;
          continue;
        }

        const geocodedCoords = await geocodeAddress(address, apiKey);
        if (!geocodedCoords) {
          console.warn(`Geocoding failed for project ${project._id}`);
          skippedGeocodeFailed += 1;
          skipped += 1;
          continue;
        }
        nextLocation = buildLocation(geocodedCoords);
        geocoded += 1;
        await delay(geocodeDelayMs);
      }

      if (!nextLocation) {
        skipped += 1;
        continue;
      }

      const setUpdate: Record<string, unknown> = {};
      const unsetUpdate: Record<string, unknown> = {};
      if (!hasLocation) {
        setUpdate["distance.location"] = nextLocation;
      }
      if (hasCoordinates) {
        unsetUpdate["distance.coordinates"] = "";
        removedLegacyCoords += 1;
      }

      if (Object.keys(setUpdate).length === 0 && Object.keys(unsetUpdate).length === 0) {
        skippedNoChange += 1;
        skipped += 1;
        continue;
      }

      if (dryRun) {
        console.log(`[Dry Run] Would update project ${project._id}`, {
          ...(Object.keys(setUpdate).length ? { $set: setUpdate } : {}),
          ...(Object.keys(unsetUpdate).length ? { $unset: unsetUpdate } : {}),
        });
        updated += 1;
        continue;
      }

      const updateCommand: Record<string, unknown> = {};
      if (Object.keys(setUpdate).length > 0) {
        updateCommand.$set = setUpdate;
      }
      if (Object.keys(unsetUpdate).length > 0) {
        updateCommand.$unset = unsetUpdate;
      }
      await Project.updateOne({ _id: project._id }, updateCommand, { strict: false });
      updated += 1;

      if (scanned % logEvery === 0) {
        console.log(`Progress: ${scanned} scanned, ${updated} updated`);
      }
    } catch (error) {
      console.error(`Failed processing project ${project._id}:`, error);
      errors += 1;
    }
  }

  const missingLocation = await Project.countDocuments({
    $or: [
      { "distance.location": { $exists: false } },
      { "distance.location.coordinates": { $size: 0 } },
    ],
  });

  console.log("Backfill summary:");
  console.log(`  scanned: ${scanned}`);
  console.log(`  updated: ${updated}`);
  console.log(`  geocoded: ${geocoded}`);
  console.log(`  from legacy coords: ${fromLegacyCoords}`);
  console.log(`  removed legacy coords: ${removedLegacyCoords}`);
  console.log(`  already had location: ${alreadyHasLocation}`);
  console.log(`  skipped: ${skipped}`);
  console.log(`    missing address: ${skippedMissingAddress}`);
  console.log(`    missing API key: ${skippedMissingKey}`);
  console.log(`    geocode failed: ${skippedGeocodeFailed}`);
  console.log(`    no changes needed: ${skippedNoChange}`);
  console.log(`  errors: ${errors}`);
  console.log(`  missing location after run: ${missingLocation}`);

  await mongoose.disconnect();
  console.log("Disconnected from MongoDB");
}

if (require.main === module) {
  backfillProjectGeo()
    .then(() => {
      console.log("Backfill script completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Backfill script failed:", error);
      process.exit(1);
    });
}

export { backfillProjectGeo };
