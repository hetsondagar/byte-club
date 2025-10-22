import mongoose, { Schema, Document } from 'mongoose';
import { Migration as IMigration } from '../types';

const migrationSchema = new Schema<IMigration>({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  appliedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for performance - name is already unique

export default mongoose.model<IMigration>('Migration', migrationSchema);
