import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoMemoryServer = null;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (uri && uri.trim() !== '') {
    try {
      const conn = await mongoose.connect(uri);
      console.log(`[MongoDB] Connected to external database: ${conn.connection.host}`);
      return conn;
    } catch (err) {
      console.warn(`[MongoDB] Failed to connect to ${uri}: ${err.message}. Falling back to in-memory database...`);
    }
  }

  // Fallback to MongoMemoryServer for instant zero-configuration local execution
  try {
    console.log('[MongoDB] Starting embedded MongoDB server...');
    mongoMemoryServer = await MongoMemoryServer.create();
    const memoryUri = mongoMemoryServer.getUri();
    const conn = await mongoose.connect(memoryUri);
    console.log(`[MongoDB] Connected to embedded in-memory MongoDB: ${memoryUri}`);
    return conn;
  } catch (memoryErr) {
    console.error(`[MongoDB] Failed to start embedded MongoDB: ${memoryErr.message}`);
    process.exit(1);
  }
};

export const closeDB = async () => {
  await mongoose.disconnect();
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
  }
};
