import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const signalSchema = new mongoose.Schema({
  signal_id: { type: String, required: true, unique: true },
  component_id: { type: String, required: true, index: true },
  component_type: { type: String, required: true },
  severity: { type: String, required: true },
  error_code: { type: String, required: true },
  message: { type: String, required: true },
  metadata: { type: Object },
  timestamp: { type: Date, required: true, index: true },
  incident_id: { type: String, index: true, default: null },
  ingested_at: { type: Date, default: Date.now }
});

export const Signal = mongoose.model('Signal', signalSchema);

export const connectMongo = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/ims';
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');
};
