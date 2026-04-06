const express = require('express');
const router = express.Router();
const https = require('https');
const path = require('path');
const fs = require('fs');
const { protect } = require('../middleware/auth');

// Read .env manually as fallback
function getGeminiKey() {
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
  try {
    const envPath = path.join(__dirname, '../.env');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/^GEMINI_API_KEY=(.+)$/m);
    if (match) return match[1].trim();
  } catch (e) {}
  return null;
}

const GEMINI_MODEL = 'gemini-2.5-flash';
const GEMINI_API_URL = 'generativelanguage.googleapis.com';

function callGemini(apiKey, parts) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      contents: [{ parts }],
      generationConfig: { temperature: 0.1, maxOutputTokens: 8192 },
    });

    const options = {
      hostname: GEMINI_API_URL,
      path: `/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const chunks = [];
    const req = https.request(options, (res) => {
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(Buffer.concat(chunks).toString()));
        } catch (e) {
          reject(new Error('Invalid JSON from Gemini'));
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// POST /api/ai/extract-resume
router.post('/extract-resume', protect, async (req, res) => {
  try {
    const { fileBase64, mimeType } = req.body;
    if (!fileBase64) return res.status(400).json({ message: 'No file data provided' });

    const apiKey = getGeminiKey();
    if (!apiKey) return res.status(500).json({ message: 'GEMINI_API_KEY not set in .env' });

    const prompt = `You are a resume parser. Extract all information from this resume and return ONLY a valid JSON object with no markdown or explanation.

Return exactly this structure:
{
  "name": "",
  "email": "",
  "phone": "",
  "location": "",
  "linkedin": "",
  "github": "",
  "objective": "",
  "education": [{"institution": "", "degree": "", "field": "", "year": "", "cgpa": ""}],
  "skills": {"technical": "", "soft": "", "tools": ""},
  "projects": [{"title": "", "description": "", "tech": "", "link": ""}],
  "experience": [{"company": "", "role": "", "duration": "", "description": ""}],
  "certifications": [{"name": "", "issuer": "", "year": ""}],
  "achievements": ""
}

Extract every detail accurately. Return ONLY the JSON.`;

    const parts = [
      { inline_data: { mime_type: mimeType, data: fileBase64 } },
      { text: prompt },
    ];

    const result = await callGemini(apiKey, parts);
    if (result.error) return res.status(500).json({ message: result.error.message });

    const text = result.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const clean = text.replace(/```json|```/g, '').trim();
    res.json(JSON.parse(clean));

  } catch (err) {
    console.error('AI extract error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// POST /api/ai/enhance-resume
router.post('/enhance-resume', protect, async (req, res) => {
  try {
    const { data, jobRole } = req.body;
    if (!jobRole) return res.status(400).json({ message: 'Job role is required' });

    const apiKey = getGeminiKey();
    if (!apiKey) return res.status(500).json({ message: 'GEMINI_API_KEY not set in .env' });

    const prompt = `You are a professional resume writer. Enhance this resume for: ${jobRole}.

Skills: ${data.skills?.technical}, Tools: ${data.skills?.tools}
Education: ${(data.education||[]).map(e=>`${e.degree} ${e.field} ${e.institution} ${e.year} ${e.cgpa}`).join('; ')}
Projects: ${(data.projects||[]).map(p=>`${p.title}: ${p.description}`).join('; ')}
Experience: ${(data.experience||[]).map(e=>`${e.role} at ${e.company}: ${e.description}`).join('; ')}
Objective: ${data.objective}
Achievements: ${data.achievements}

Return ONLY valid JSON:
{
  "objective": "enhanced objective for ${jobRole}",
  "skills": {"technical": "", "soft": "", "tools": ""},
  "projects": [{"title": "", "description": "", "tech": "", "link": ""}],
  "experience": [{"company": "", "role": "", "duration": "", "description": ""}],
  "achievements": ""
}`;

    const result = await callGemini(apiKey, [{ text: prompt }]);
    if (result.error) return res.status(500).json({ message: result.error.message });

    const text = result.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const clean = text.replace(/```json|```/g, '').trim();
    res.json(JSON.parse(clean));

  } catch (err) {
    console.error('AI enhance error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;