import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const alertHistorySchema = new mongoose.Schema({
  alert_id: { type: String, required: true },
  incident_id: { type: String, required: true },
  component_type: { type: String, required: true },
  severity: { type: String, required: true },
  channel: { type: String, enum: ['email', 'webhook', 'log'], required: true },
  recipient: { type: String, required: true },
  status: { type: String, enum: ['sent', 'failed'], required: true },
  error: { type: String, default: null },
  sent_at: { type: Date, default: Date.now }
});

export const AlertHistory = mongoose.model('AlertHistory', alertHistorySchema);

export const connectMongo = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/ims';
  await mongoose.connect(uri);
};
