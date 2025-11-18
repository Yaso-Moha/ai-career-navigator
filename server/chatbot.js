// server/chatbot.js

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import OpenAI from 'openai';
import fetch from 'node-fetch';
import FormData from 'form-data';
import mammoth from 'mammoth';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY.trim() });

Meteor.methods({
  // ─── PROFILE MODE ───────────────────────────────────────────────────────────
  async 'chatbot.fromProfile'({ question, userProfile }) {
    check(question, String);
    check(userProfile, Object);

    const keywordPattern = /\b(course|skill|improve|career|learn|develop|advance|Skills|Skill|upgrade|Improve|Courses|Course)\b/i;
    if (!keywordPattern.test(question)) {
      throw new Meteor.Error(
        'invalid-question',
        '❗️ Please ask about courses, skills to improve, or career guidance.'
      );
    }

    const profileText = Object.entries(userProfile || {})
      .map(([key, val]) => `${key}: ${val}`)
      .join('\n');

    const systemPrompt = `
You are a career advisor AI. Based on the user profile below, recommend 3–5 high‐quality online courses. For each recommendation:
  1) One‐sentence description of why this topic helps their career.
  2) Indicate (Free) or (Paid).
  3) Provide a Markdown‐formatted **search link** to a major catalog (Coursera, FutureLearn, or Udemy), so that clicking it will show real courses. Use this structure:
     • Coursera: \`https://www.coursera.org/search?query=<keywords>\`  
     • FutureLearn:      \`https://www.futurelearn.com/search?q=<keywords>\`  
     • Udemy:    \`https://www.udemy.com/courses/search/?q=<keywords>\`  
     Replace \`<keywords>\` with URL‐encoded terms (e.g. \`data+analysis\`). Wrap each link like:
     \`[PLATFORM](https://...)\`

Separate each recommendation with a blank line. Do NOT provide any direct course page—only the search page link.
`.trim();

    const userPrompt = `
User Profile:
${profileText}

Question:
${question}
`.trim();

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4.1-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user',   content: userPrompt }
        ],
        temperature: 0.5,
        max_tokens: 800
      });

      let raw = response.choices[0].message.content.trim();

      // 1) Clean up Markdown links
      raw = raw.replace(
        /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
        (_full, label, url) => {
          const cleaned = url.replace(/\)+$/, '');
          return `[${label}](${cleaned})`;
        }
      );

      // 2) ALSO strip any trailing ")" from plain URLs
      raw = raw.replace(
        /(https?:\/\/[^\s)]+)\)+/g,
        (_full, url) => url
      );

      return raw;

    } catch (err) {
      console.error('[chatbot.fromProfile] OpenAI error:', err);
      throw new Meteor.Error(
        'openai-failed',
        '⚠️ Could not generate a response. Please try again later.'
      );
    }
  },

  // ─── RESUME MODE ─────────────────────────────────────────────────────────────
  async 'chatbot.processResume'({ base64, filename }) {
    check(base64, String);
    check(filename, String);

    if (!base64 || !filename) {
      throw new Meteor.Error(
        'missing-input',
        '❗️ Missing file data or filename. Please upload a valid PDF or DOCX.'
      );
    }

    const matches = base64.match(/^data:.*;base64,(.*)$/);
    if (!matches || matches.length < 2) {
      throw new Meteor.Error(
        'invalid-base64',
        '❗️ Invalid file format. Please upload as PDF or DOCX.'
      );
    }
    const buffer = Buffer.from(matches[1], 'base64');

    let resumeText = '';

    if (filename.toLowerCase().endsWith('.pdf')) {
      try {
        const form = new FormData();
        form.append('file', buffer, filename);

        const response = await fetch('http://localhost:5001/extract-cv-text', {
          method: 'POST',
          body: form
        });
        const data = await response.json();

        if (!response.ok || !data.text) {
          throw new Error(data.error || 'Flask extraction failed');
        }
        resumeText = data.text.trim();
        if (!resumeText) throw new Error('No text extracted by Flask');
      } catch (err) {
        console.error('[chatbot.processResume] PDF extraction error:', err);
        return '❗️ Could not parse the PDF. Please try a different PDF or upload as a Word document.';
      }
    }
    else if (filename.toLowerCase().endsWith('.docx')) {
      try {
        const result = await mammoth.extractRawText({ buffer });
        resumeText = (result.value || '').trim();
        if (!resumeText) throw new Error('No text extracted from DOCX');
      } catch (err) {
        console.error('[chatbot.processResume] DOCX parse error:', err);
        throw new Meteor.Error(
          'docx-parse-failed',
          '❗️ Could not read the Word document. Please try a valid .docx file.'
        );
      }
    } 
    else {
      throw new Meteor.Error(
        'unsupported-type',
        '❗️ Unsupported file type. Please upload a PDF or DOCX document.'
      );
    }

    if (!resumeText) {
      throw new Meteor.Error(
        'empty-resume',
        '❗️ The uploaded file contains no extractable text.'
      );
    }

    const systemPrompt = `
You are an AI that reads a user’s resume (plaintext) and first gives a very short summary of their background (1–2 sentences). Then recommend 3–5 learning topics or career tips. For each recommendation:
  1) A one‐sentence description of why this helps their career.
  2) Mark (Free) or (Paid).
  3) A Markdown‐formatted **search link** to Coursera, edX, or Udemy. Use exactly:
     • Coursera: \`https://www.coursera.org/search?query=<keywords>\`  
     • FutureLearn:      \`https://www.futurelearn.com/search?q=<keywords>\`  
     • Udemy:   \`https://www.udemy.com/courses/search/?q=<keywords>\`  
     Replace \`<keywords>\` with URL‐encoded terms (e.g. \`machine+learning\`).  
     Wrap each link like:  
     \`[PLATFORM](https://...)\`

Do NOT provide any direct course URL—only the search‐page link. Separate each recommendation with a blank line.
`.trim();

    const userPrompt = `
Resume text:
"""${resumeText}"""
`.trim();

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4.1-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user',   content: userPrompt }
        ],
        temperature: 0.5,
        max_tokens: 900
      });

      let raw = response.choices[0].message.content.trim();

      // 1) Clean up Markdown links
      raw = raw.replace(
        /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
        (_full, label, url) => {
          const cleaned = url.replace(/\)+$/, '');
          return `[${label}](${cleaned})`;
        }
      );

      // 2) ALSO strip any trailing ")" from plain URLs
      raw = raw.replace(
        /(https?:\/\/[^\s)]+)\)+/g,
        (_full, url) => url
      );

      return raw;

    } catch (err) {
      console.error('[chatbot.processResume] OpenAI error:', err);
      throw new Meteor.Error(
        'openai-failed',
        '⚠️ Could not generate suggestions. Please try again later.'
      );
    }
  }
});
