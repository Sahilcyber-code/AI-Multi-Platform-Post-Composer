import mongoose from 'mongoose';

const draftSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Draft title is required'],
      trim: true,
    },
    content: {
      type: String,
      default: '',
    },
    platforms: {
      type: [String],
      default: [],
    },
    media: {
      name: { type: String, default: '' },
      type: { type: String, default: '' },
      path: { type: String, default: '' }, // Path on the server upload directory
    },
    isFavourite: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Draft = mongoose.model('Draft', draftSchema);
export default Draft;
