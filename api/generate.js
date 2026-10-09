import { GoogleGenAI } from '@google/genai';

export default async function handler(req, res) {
  // 1. Enforce POST request method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  // 2. Access server environment variable (Never exposed to client)
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ 
      error: 'GEMINI_API_KEY environment variable is missing on server.' 
    });
  }

  // 3. Extract and validate user input
  const { notes } = req.body || {};
  if (!notes || typeof notes !== 'string' || !notes.trim()) {
    return res.status(400).json({ error: 'Please provide valid notes text to revise.' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
You are an elite academic tutor helping a university student prep for upcoming exams.
Convert the following messy notes into structured, high-yield exam revision material.

Format your output in clean HTML (DO NOT include <html> or <body> tags, only structural tags like <h3>, <ul>, <li>, <p>, <strong>, and <div class="flashcard">).

Include 3 distinct sections:
1. 📌 **High-Yield Summary**: 3-5 crucial key takeaways.
2. ⚡ **Core Concepts & Definitions**: Essential terms, formulas, or rules.
3. 🎴 **Quick Revision Flashcards**: 4-5 Q&A pairs in simple question/answer bullet format.

Messy Notes to process:
"""
${notes.trim()}
"""
`;

    // Call Gemini 2.5 Flash model
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const resultText = response.text || '<p>No revision content generated.</p>';

    return res.status(200).json({ result: resultText });

  } catch (error) {
    console.error('Serverless Gemini API Error:', error);
    return res.status(500).json({ 
      error: error.message || 'An error occurred while generating revision notes.' 
    });
  }
}
