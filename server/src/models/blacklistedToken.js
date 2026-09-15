import mongoose from 'mongoose';

const blacklistedTokenSchema = new mongoose.Schema(
  {
    token: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true, index: { expires: 0 } }
  },
  { collection: 'blacklisted_tokens' }
);

export const BlacklistedToken = mongoose.model('BlacklistedToken', blacklistedTokenSchema);