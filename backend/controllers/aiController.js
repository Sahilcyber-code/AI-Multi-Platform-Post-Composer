import aiService from '../services/aiService.js';

// @desc    Generate text/suggestions using AI (OpenAI, Gemini, or Local fallback)
// @route   POST /api/ai/generate
// @access  Private
export const generateAISuggestions = async (req, res) => {
  const { text, option } = req.body;

  try {
    const result = await aiService.generateText(text, option);
    res.json({ result });
  } catch (error) {
    console.error('AI Controller Error:', error);
    res.status(500).json({ message: 'Server error generating AI content', error: error.message });
  }
};
