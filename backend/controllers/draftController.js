import Draft from '../models/Draft.js';

// @desc    Get all drafts for a user with search and filtering
// @route   GET /api/drafts
// @access  Private
export const getDrafts = async (req, res) => {
  try {
    const query = { user: req.user._id };

    // Search query (matches title or content case-insensitively)
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query.$or = [
        { title: searchRegex },
        { content: searchRegex }
      ];
    }

    // Filter by platform
    if (req.query.platform) {
      query.platforms = req.query.platform;
    }

    // Filter by isFavourite
    if (req.query.favourite === 'true') {
      query.isFavourite = true;
    }

    const drafts = await Draft.find(query).sort({ updatedAt: -1 });
    res.json(drafts);
  } catch (error) {
    console.error('Fetch drafts error:', error);
    res.status(500).json({ message: 'Server error retrieving drafts' });
  }
};

// @desc    Create a new draft
// @route   POST /api/drafts
// @access  Private
export const createDraft = async (req, res) => {
  const { title, content, platforms, media } = req.body;

  try {
    const draft = new Draft({
      user: req.user._id,
      title: title || 'Untitled Draft',
      content: content || '',
      platforms: platforms || [],
      media: media || { name: '', type: '', path: '' },
    });

    const savedDraft = await draft.save();
    res.status(201).json(savedDraft);
  } catch (error) {
    console.error('Create draft error:', error);
    res.status(500).json({ message: 'Server error creating draft' });
  }
};

// @desc    Update a draft
// @route   PUT /api/drafts/:id
// @access  Private
export const updateDraft = async (req, res) => {
  const { title, content, platforms, media } = req.body;

  try {
    let draft = await Draft.findById(req.params.id);

    if (!draft) {
      return res.status(404).json({ message: 'Draft not found' });
    }

    // Verify ownership
    if (draft.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this draft' });
    }

    draft.title = title || draft.title;
    draft.content = content !== undefined ? content : draft.content;
    draft.platforms = platforms || draft.platforms;
    if (media) {
      draft.media = media;
    }

    const updatedDraft = await draft.save();
    res.json(updatedDraft);
  } catch (error) {
    console.error('Update draft error:', error);
    res.status(500).json({ message: 'Server error updating draft' });
  }
};

// @desc    Delete a draft
// @route   DELETE /api/drafts/:id
// @access  Private
export const deleteDraft = async (req, res) => {
  try {
    const draft = await Draft.findById(req.params.id);

    if (!draft) {
      return res.status(404).json({ message: 'Draft not found' });
    }

    // Verify ownership
    if (draft.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this draft' });
    }

    await Draft.findByIdAndDelete(req.params.id);
    res.json({ message: 'Draft deleted successfully' });
  } catch (error) {
    console.error('Delete draft error:', error);
    res.status(500).json({ message: 'Server error deleting draft' });
  }
};

// @desc    Toggle favourite status of a draft
// @route   POST /api/drafts/:id/favourite
// @access  Private
export const toggleFavouriteDraft = async (req, res) => {
  try {
    const draft = await Draft.findById(req.params.id);

    if (!draft) {
      return res.status(404).json({ message: 'Draft not found' });
    }

    // Verify ownership
    if (draft.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to modify this draft' });
    }

    draft.isFavourite = !draft.isFavourite;
    await draft.save();

    res.json(draft);
  } catch (error) {
    console.error('Toggle favourite error:', error);
    res.status(500).json({ message: 'Server error favoriting draft' });
  }
};

// @desc    Duplicate an existing draft
// @route   POST /api/drafts/:id/duplicate
// @access  Private
export const duplicateDraft = async (req, res) => {
  try {
    const draft = await Draft.findById(req.params.id);

    if (!draft) {
      return res.status(404).json({ message: 'Draft not found' });
    }

    // Verify ownership
    if (draft.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to clone this draft' });
    }

    const clonedDraft = new Draft({
      user: req.user._id,
      title: `${draft.title} (Copy)`,
      content: draft.content,
      platforms: draft.platforms,
      media: draft.media,
      isFavourite: false,
    });

    const savedClonedDraft = await clonedDraft.save();
    res.status(201).json(savedClonedDraft);
  } catch (error) {
    console.error('Duplicate draft error:', error);
    res.status(500).json({ message: 'Server error cloning draft' });
  }
};

// @desc    Delete all drafts for the logged-in user
// @route   DELETE /api/drafts
// @access  Private
export const deleteAllDrafts = async (req, res) => {
  try {
    await Draft.deleteMany({ user: req.user._id });
    res.json({ message: 'All drafts deleted successfully' });
  } catch (error) {
    console.error('Delete all drafts error:', error);
    res.status(500).json({ message: 'Server error deleting all drafts' });
  }
};
