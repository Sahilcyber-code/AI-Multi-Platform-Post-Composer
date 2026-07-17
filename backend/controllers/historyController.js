import PublishHistory from '../models/PublishHistory.js';

// @desc    Get publish history with search and filter
// @route   GET /api/history
// @access  Private
export const getPublishHistory = async (req, res) => {
  try {
    const query = { user: req.user._id };

    // Search filter (searches within the post text)
    if (req.query.search) {
      query.post = new RegExp(req.query.search, 'i');
    }

    // Platform filter
    if (req.query.platform) {
      query.platform = req.query.platform;
    }

    // Status filter
    if (req.query.status) {
      query.status = req.query.status;
    }

    const history = await PublishHistory.find(query).sort({ publishedAt: -1 });
    res.json(history);
  } catch (error) {
    console.error('Fetch history error:', error);
    res.status(500).json({ message: 'Server error retrieving publish history' });
  }
};

// @desc    Create a publish history entry
// @route   POST /api/history
// @access  Private
export const createPublishHistory = async (req, res) => {
  const { post, platform, status, media } = req.body;

  try {
    const historyEntry = new PublishHistory({
      user: req.user._id,
      post,
      platform,
      status: status || 'Published',
      media: media || { name: '', path: '' },
    });

    const savedEntry = await historyEntry.save();
    res.status(201).json(savedEntry);
  } catch (error) {
    console.error('Create history entry error:', error);
    res.status(500).json({ message: 'Server error saving publish log' });
  }
};

// @desc    Delete a publish history entry
// @route   DELETE /api/history/:id
// @access  Private
export const deletePublishHistory = async (req, res) => {
  try {
    const historyEntry = await PublishHistory.findById(req.params.id);

    if (!historyEntry) {
      return res.status(404).json({ message: 'History entry not found' });
    }

    // Verify ownership
    if (historyEntry.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this record' });
    }

    await PublishHistory.findByIdAndDelete(req.params.id);
    res.json({ message: 'History entry deleted successfully' });
  } catch (error) {
    console.error('Delete history error:', error);
    res.status(500).json({ message: 'Server error deleting publish log' });
  }
};
