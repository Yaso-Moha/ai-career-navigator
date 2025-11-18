// imports/api/mockInterview.js
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import OpenAI from 'openai';
import { interviewQuestions } from '/imports/data/interviewQuestions';

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  throw new Error('Missing OPENAI_API_KEY in process.env');
}
const openai = new OpenAI({ apiKey });
const MODEL = 'gpt-3.5-turbo'; // Cheap & reliable

Meteor.methods({
  async getMockQuestions(profile) {
    check(profile, Object);
    const { career, experience, education } = profile;
    check(career, String);
    check(experience, String);
    check(education, String);

    const staticList = interviewQuestions[career]?.[experience];
    if (Array.isArray(staticList) && staticList.length >= 10) {
      return staticList;
    }

    const systemPrompt = `
You are a professional interviewer. Generate 10 unique, diverse interview questions for a:
• Role: ${career}
• Experience: ${experience}
• Education: ${education}
Respond as a JSON array: ["Q1", "Q2", ..., "Q10"]
Do NOT add commentary or explanations.
`;

    const resp = await openai.chat.completions.create({
      model: MODEL,
      messages: [{ role: 'system', content: systemPrompt }]
    });

    try {
      return JSON.parse(resp.choices[0].message.content);
    } catch {
      return [];
    }
  },

  async getMockFeedback({ answer, profile, question }) {
    check(answer, String);
    check(profile, Object);
    const { career, experience, education } = profile;
    check(career, String);
    check(experience, String);
    check(education, String);
    check(question, String);

    const systemPrompt = `
You are an expert interviewer.
Rate this answer for the given question on a scale of 1–5:
- Clarity
- Completeness
- Technical Accuracy

Then give bullet-point feedback.
Respond ONLY in this JSON format:
{
  "scores": {
    "clarity": 4,
    "completeness": 3,
    "technical": 4
  },
  "feedback": [
    "Good structure",
    "Add more technical examples"
  ]
}
`;

    const userPrompt = `Question: ${question}\nAnswer: ${answer}`;

    const resp = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]
    });

    try {
      return JSON.parse(resp.choices[0].message.content);
    } catch {
      return {
        scores: { clarity: 3, completeness: 3, technical: 3 },
        feedback: ["Could not parse detailed feedback."]
      };
    }
  }
});
