import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

// Reuse connection across hot-reloads in Next.js dev mode
const cache = global as typeof global & {
  _mongoConn: typeof mongoose | null;
  _mongoPromise: Promise<typeof mongoose> | null;
};

if (!cache._mongoConn) {
  cache._mongoConn = null;
  cache._mongoPromise = null;
}

export async function connectDB(): Promise<typeof mongoose> {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not set in .env.local");
  }

  if (cache._mongoConn) return cache._mongoConn;

  if (!cache._mongoPromise) {
    cache._mongoPromise = mongoose.connect(MONGODB_URI, { bufferCommands: false });
  }

  cache._mongoConn = await cache._mongoPromise;
  return cache._mongoConn;
}
