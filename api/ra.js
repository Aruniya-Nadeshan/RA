export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const { messages, systemPrompt } = req.body;
    const geminiMessages = [];
    geminiMessages.push({
      role: "user",
      parts: [{ text: systemPrompt }]
    });
    geminiMessages.push({
      role: "model",
      parts: [{ text: "Understood. I am Ra, and I will respond accordingly." }]
    });
    messages.forEach(function(msg) {
      geminiMessages.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      });
    });
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-001:generateContent?key=" + process.env.GEMINI_API_KEY,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: geminiMessages,
          generationConfig: {
            temperature: 0.9,
            maxOutputTokens: 1000
          }
        })
      }
    );
    const data = await response.json();
    console.log('Full Gemini response:', JSON.stringify(data));
    if (data.error) {
      console.log('Gemini error:', data.error.message);
      return res.status(500).json({ error: data.error.message });
    }
    if (!data.candidates || !data.candidates[0]) {
      console.log('No candidates in response');
      return res.status(500).json({ error: 'No response from Gemini' });
    }
    const text = data.candidates[0].content.parts[0].text;
    res.status(200).json({ text: text });
  } catch (error) {
    console.error('Ra function error:', error.message);
    res.status(500).json({ error: error.message });
  }
}
