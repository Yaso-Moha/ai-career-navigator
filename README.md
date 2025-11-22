# Career Navigator — Frontend

This is the frontend for the Career Navigator system.  
It allows users to upload resumes and view recommendations based on the backend analysis.

## Features

- Simple interface for uploading resumes  
- Displays extracted information and recommended roles  
- Create your resume in one-click
- parse large number of CVs and filter them out
- enjoy a chatbot that knows you and advice you some knowledge and cources 
- Easy local setup

## Setup

```bash
git clone https://github.com/Yaso-Moha/ai-career-navigator
cd ai-career-navigator
meteor npm install

## Running

Start the frontend with:

```bash
meteor

http://localhost:3000

## Backend Service

This frontend connects to the resume parser backend:

https://github.com/Yaso-Moha/resume_parser_service

---

## License

MIT License


Note : You would need your own API (OPENAI , Gemini , deepseek ) for the chatbot to work.
