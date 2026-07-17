// Modular AI Service
import axios from 'axios';

class AIService {
  constructor() {
    this.geminiKey = process.env.GEMINI_API_KEY;
    this.openaiKey = process.env.OPENAI_API_KEY;
  }

  /**
   * Main text generation coordinator
   * @param {string} text Input text
   * @param {string} option Selected style / action
   * @returns {Promise<string>} Generated text
   */
  async generateText(text, option) {
    if (this.geminiKey) {
      return this.generateWithGemini(text, option);
    } else if (this.openaiKey) {
      return this.generateWithOpenAI(text, option);
    } else {
      return this.generateLocalFallback(text, option);
    }
  }

  /**
   * Call Google Gemini API
   */
  async generateWithGemini(text, option) {
    try {
      const prompt = this.getPromptForOption(text, option);
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.geminiKey}`;
      
      const response = await axios.post(url, {
        contents: [{ parts: [{ text: prompt }] }],
      });

      const generated = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (generated) return generated.trim();
      throw new Error('Empty response from Gemini');
    } catch (error) {
      console.error('Gemini API Error, falling back to local:', error.message);
      return this.generateLocalFallback(text, option);
    }
  }

  /**
   * Call OpenAI GPT API
   */
  async generateWithOpenAI(text, option) {
    try {
      const prompt = this.getPromptForOption(text, option);
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are an expert social media post optimizer.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.openaiKey}`,
          },
        }
      );

      const generated = response.data?.choices?.[0]?.message?.content;
      if (generated) return generated.trim();
      throw new Error('Empty response from OpenAI');
    } catch (error) {
      console.error('OpenAI API Error, falling back to local:', error.message);
      return this.generateLocalFallback(text, option);
    }
  }

  /**
   * Helper to structure prompts for API calls
   */
  getPromptForOption(text, option) {
    const basePrompts = {
      improve: `Improve the writing and clarity of the following post. Make it highly engaging while keeping the core message intact:\n\n"${text}"`,
      professional: `Rewrite the following post to have a professional, polished, and corporate tone suitable for LinkedIn:\n\n"${text}"`,
      funny: `Rewrite the following post with a funny, witty, and humorous tone. Add puns or jokes if appropriate:\n\n"${text}"`,
      formal: `Rewrite the following post in a polite, highly respectful, and formal tone:\n\n"${text}"`,
      short: `Provide a concise, short version of the following post suitable for Twitter (keep it brief and punchy):\n\n"${text}"`,
      long: `Provide an elaborated, detailed, and longer version of the following post. Use formatting like bullet points or emojis if it helps readability:\n\n"${text}"`,
      hashtags: `Analyze the following text and generate 5 to 8 highly relevant, popular hashtags. Return ONLY the hashtags separated by spaces:\n\n"${text}"`,
      emojis: `Add appropriate and engaging emojis throughout the following text without altering the words significantly:\n\n"${text}"`,
      cta: `Create a strong, engaging Call-To-Action (CTA) sentence suitable for the end of the following post. Return ONLY the CTA sentence:\n\n"${text}"`,
      caption: `Create an eye-catching, attention-grabbing caption/hook for the following post, with a hook at the top and spacing:\n\n"${text}"`
    };

    return basePrompts[option] || `Optimize the following text:\n\n"${text}"`;
  }

  /**
   * Smart local heuristic text transformer
   */
  generateLocalFallback(text, option) {
    const trimmed = text.trim();
    if (!trimmed) return 'Please type some text first to apply AI suggestions!';

    const keywords = (trimmed.toLowerCase().match(/[a-zA-Z]+/g) || []).slice(0, 10);
    const tags = keywords
      .filter((w) => w.length > 4)
      .map((w) => `#${w.charAt(0).toUpperCase()}${w.slice(1)}`)
      .slice(0, 5);

    switch (option) {
      case 'improve':
        return `✨ Optimized: ${trimmed.replace(/\b(good|nice|ok)\b/gi, 'exceptional')} \n\n🚀 Rephrased for higher engagement.`;
        
      case 'professional':
        return `💼 Professional Tone:\n"I wanted to share that ${trimmed.charAt(0).toLowerCase()}${trimmed.slice(1)} This development aligns with our goals of optimizing workflows and maximizing overall project efficiency."`;
        
      case 'funny':
        return `🎉 Funny Version:\n"${trimmed} (Because let's face it, doing it the other way is how we end up crying in front of a compilation error on a Friday afternoon! ☕💻)"`;
        
      case 'formal':
        return `👔 Formal Version:\n"Dear Network, I am pleased to convey that ${trimmed.charAt(0).toLowerCase()}${trimmed.slice(1)} Should you have any inquiries, please do not hesitate to contact us. Kind regards."`;
        
      case 'short':
        return trimmed.length > 120 ? `${trimmed.slice(0, 120)}...` : trimmed;
        
      case 'long':
        return `📝 Detailed Overview:\n\n${trimmed}\n\nKey Takeaways:\n• Enhanced efficiency and ease of use\n• Modern cross-platform compatibility\n• Fast results with simple workflows`;
        
      case 'hashtags':
        return tags.length > 0 ? tags.join(' ') : '#React #MERN #Composer #SaaS #AI';
        
      case 'emojis':
        return `✨ ${trimmed} 🚀 🔥 Let's go!`;
        
      case 'cta':
        return `${trimmed}\n\n💬 What are your thoughts on this? Let me know in the comments below! 👇`;
        
      case 'caption':
        return `💥 HOOK: You don't want to miss this!\n\n${trimmed}\n\n👇 Read more details below.`;

      default:
        return trimmed;
    }
  }
}

export default new AIService();
