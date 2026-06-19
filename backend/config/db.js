// Database connection helper. Centralises Mongo connection so the rest of the app
// just imports and calls connectDB() at boot time.

const mongoose = require('mongoose');

// Connect to MongoDB using the URI from environment variables.
// We bail out hard on failure so the process doesn't run with a broken DB.
async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error('MONGO_URI is not set in environment');
  }

  // Mongoose 8 already has sensible defaults, so we keep options minimal.
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 15000,
  });

  return mongoose.connection;
}

// Quick helper used by the /health endpoint to tell us if the DB link is alive.
function dbStatus() {
  // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  return states[mongoose.connection.readyState] || 'unknown';
}

module.exports = { connectDB, dbStatus };
