import mongoose from 'mongoose';

const publishHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    post: {
      type: String,
      required: true,
    },
    platform: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      default: 'Published',
    },
    media: {
      name: { type: String, default: '' },
      path: { type: String, default: '' },
    },
    publishedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const PublishHistory = mongoose.model('PublishHistory', publishHistorySchema);
export default PublishHistory;
