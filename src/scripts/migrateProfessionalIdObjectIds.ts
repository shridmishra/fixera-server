import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const toObjectId = (value: unknown): mongoose.Types.ObjectId | null => {
  if (value instanceof mongoose.Types.ObjectId) {
    return value;
  }
  if (typeof value === "string" && mongoose.Types.ObjectId.isValid(value)) {
    return new mongoose.Types.ObjectId(value);
  }
  return null;
};

async function migrateProfessionalIdsToObjectIds() {
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error("MONGO_URI or MONGODB_URI not found in environment variables");
  }

  await mongoose.connect(mongoUri);
  console.log("Connected to MongoDB");

  const db = mongoose.connection.db;
  if (!db) {
    throw new Error("MongoDB connection is missing database handle");
  }
  const projects = db.collection("projects");
  const meetings = db.collection("meetings");
  const BATCH_SIZE = 500;

  let projectUpdated = 0;
  let projectSkippedInvalid = 0;
  let meetingUpdated = 0;
  let meetingSkippedInvalid = 0;

  const projectCursor = projects.find(
    { professionalId: { $exists: true } },
    { projection: { professionalId: 1 } }
  );
  let projectOps: any[] = [];

  for await (const project of projectCursor) {
    const converted = toObjectId(project.professionalId);
    if (!converted) {
      console.warn(
        `[MIGRATION][PROJECT] Skipping invalid professionalId for project ${project._id}:`,
        project.professionalId
      );
      projectSkippedInvalid++;
      continue;
    }

    if (!(project.professionalId instanceof mongoose.Types.ObjectId)) {
      projectOps.push({
        updateOne: {
          filter: { _id: project._id },
          update: { $set: { professionalId: converted } },
        },
      });

      if (projectOps.length >= BATCH_SIZE) {
        const result = await projects.bulkWrite(projectOps, { ordered: false });
        projectUpdated += result.modifiedCount;
        projectOps = [];
      }
    }
  }

  if (projectOps.length > 0) {
    const result = await projects.bulkWrite(projectOps, { ordered: false });
    projectUpdated += result.modifiedCount;
    projectOps = [];
  }

  const meetingCursor = meetings.find(
    { professionalId: { $exists: true } },
    { projection: { professionalId: 1 } }
  );
  let meetingOps: any[] = [];

  for await (const meeting of meetingCursor) {
    const converted = toObjectId(meeting.professionalId);
    if (!converted) {
      console.warn(
        `[MIGRATION][MEETING] Skipping invalid professionalId for meeting ${meeting._id}:`,
        meeting.professionalId
      );
      meetingSkippedInvalid++;
      continue;
    }

    if (!(meeting.professionalId instanceof mongoose.Types.ObjectId)) {
      meetingOps.push({
        updateOne: {
          filter: { _id: meeting._id },
          update: { $set: { professionalId: converted } },
        },
      });

      if (meetingOps.length >= BATCH_SIZE) {
        const result = await meetings.bulkWrite(meetingOps, { ordered: false });
        meetingUpdated += result.modifiedCount;
        meetingOps = [];
      }
    }
  }

  if (meetingOps.length > 0) {
    const result = await meetings.bulkWrite(meetingOps, { ordered: false });
    meetingUpdated += result.modifiedCount;
    meetingOps = [];
  }

  console.log("Migration complete:");
  console.log(`  Projects updated: ${projectUpdated}`);
  console.log(`  Projects skipped (invalid): ${projectSkippedInvalid}`);
  console.log(`  Meetings updated: ${meetingUpdated}`);
  console.log(`  Meetings skipped (invalid): ${meetingSkippedInvalid}`);

  await mongoose.disconnect();
  console.log("Disconnected from MongoDB");
}

if (require.main === module) {
  migrateProfessionalIdsToObjectIds()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Failed to migrate professionalId fields:", error);
      process.exit(1);
    });
}

export { migrateProfessionalIdsToObjectIds };
