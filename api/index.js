process.env.IS_SERVERLESS = '1';

import dotenv from 'dotenv';
dotenv.config();

import app from '../backend/server.js';
import { connectDB } from '../backend/config/db.js';

export default async function handler(req, res) {
  try {
    await connectDB();
  } catch (err) {
    console.error('[Vercel Serverless DB Connection Error]:', err.message);
  }

  return app(req, res);
}
