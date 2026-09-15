import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let cachedConnection = null;
let mongoMemoryServer = null;

export const connectDB = async () => {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  const uri = process.env.MONGODB_URI;

  if (uri && uri.trim() !== '') {
    try {
      const conn = await mongoose.connect(uri, {
        bufferCommands: false,
      });
      cachedConnection = conn;
      console.log(`[MongoDB] Connected to external database: ${conn.connection.host}`);
      return conn;
    } catch (err) {
      console.warn(`[MongoDB] Failed to connect to external DB: ${err.message}.`);
      if (process.env.VERCEL) {
        throw err;
      }
    }
  }

  // Fallback to MongoMemoryServer for instant zero-configuration local development
  if (!process.env.VERCEL) {
    try {
      if (!mongoMemoryServer) {
        console.log('[MongoDB] Starting embedded MongoDB server...');
        mongoMemoryServer = await MongoMemoryServer.create();
      }
      const memoryUri = mongoMemoryServer.getUri();
      const conn = await mongoose.connect(memoryUri);
      cachedConnection = conn;
      console.log(`[MongoDB] Connected to embedded in-memory MongoDB: ${memoryUri}`);
      return conn;
    } catch (memoryErr) {
      console.error(`[MongoDB] Failed to start embedded MongoDB: ${memoryErr.message}`);
      process.exit(1);
    }
  }
};

export const closeDB = async () => {
  await mongoose.disconnect();
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
  }
};
