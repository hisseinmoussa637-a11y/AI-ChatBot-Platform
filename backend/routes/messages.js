const express = require('express');
const OpenAI = require('openai');
const authMiddleware = require('../middleware/auth');
const Message = require('../models/Message');

const router = express.Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.get('/', authMiddleware, async (req, res) => {
  try {
    const messages = await Message.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    return res.json(messages);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.post('/send', authMiddleware, async (req, res) => {
  try {
    const { userMessage } = req.body;

    if (!userMessage || !userMessage.trim()) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: userMessage }],
      max_tokens: 1000,
    });

    const aiResponse = completion.choices[0].message.content;

    const message = new Message({
      userId: req.user.userId,
      userMessage,
      aiResponse,
    });

    await message.save();

    return res.status(201).json({
      message: 'Message sent successfully',
      data: message,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to generate response' });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const message = await Message.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    return res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;
