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


Extra Steps if someone did not know how to to make it work. 
- once you clone it to your device (cd) to the folder "ai-career-navigator" and then type (meteor) so that the server start but before this make sure the backend is working .
link for the backend : https://github.com/Yaso-Moha/resume_parser_service  .

instructions for the backend :
- Go to the link above and clone it then (cd) to the folder you may name it "resume-parser-service" and then run the python file inside it by typing ( python "then the name of the file" ).

note : make sure that you input your API key first .

common issues for api can be fixed by this command : export OPENAI_API_KEY="YOUR API KEY" and then this "exec $SHELL" .
