# 🧭 Career Navigator

<div align="center">

[![Meteor](https://img.shields.io/badge/Meteor-3.0-de4f4f?logo=meteor)](https://www.meteor.com/)
[![React](https://img.shields.io/badge/React-18-61dafb?logo=react)](https://react.dev/)
[![MUI](https://img.shields.io/badge/MUI-7-007fff?logo=mui)](https://mui.com/)
[![License](https://img.shields.io/badge/License-MIT-green)](./LICENSE)

**A full‑stack career counselling platform** — upload your resume, get AI‑powered role recommendations, practice mock interviews, estimate salaries, and chat with a career advisor, all in one place.

</div>

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📄 **Resume Parser** | Upload PDF/DOCX resumes and get structured insights (skills, experience, summary) via the [resume parser service](https://github.com/Yaso-Moha/resume_parser_service) |
| 📂 **Bulk CV Filtering** | Upload multiple resumes (or a ZIP) and filter them with natural‑language queries powered by AI |
| 📝 **Resume Builder** | Generate a polished, printable resume in one click from your profile data |
| 🤖 **AI Career Advisor** | Chat with an AI assistant that knows your profile and gives personalized career advice & course recommendations |
| 🎤 **Mock Interview** | Practice interviews with AI‑generated questions and structured feedback |
| 💰 **Salary Estimator** | Explore salary ranges by role, experience level and location with interactive charts |
| 🔐 **Role‑Based Access** | Job‑seeker and admin roles with protected routes |
| 📊 **Admin Dashboard** | View platform analytics, user statistics, and feedback charts |
| 👤 **Profile Setup** | Build a detailed professional profile to get better recommendations |
| 🎨 **Modern UI** | Material UI, Framer Motion animations, and responsive design |

---

## 🏗️ Architecture

```
┌──────────────────────────┐      ┌──────────────────────────┐
│   Career Navigator        │      │   Resume Parser Service   │
│   (Meteor + React)        │◄────►│   (Flask + Python)        │
│                           │ HTTP │                          │
│  • Frontend + Backend     │      │  • PDF/DOCX text extraction│
│  • User auth & profiles   │      │  • AI resume filtering     │
│  • Chatbot (OpenAI)       │      │  • Role recommendations    │
│  • Mock interviews        │      │                          │
│  • Salary data            │      └──────────────────────────┘
└──────────────────────────┘
         │
         ▼
   ┌──────────┐
   │ OpenAI API│  (chatbot, filtering, recommendations)
   └──────────┘
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) ≥ 18
- [Meteor.js](https://www.meteor.com/developers/install) (install globally)
- An **OpenAI API key** ([get one here](https://platform.openai.com/api-keys))
- The [resume parser backend](https://github.com/Yaso-Moha/resume_parser_service) running (see its README)

### 1. Clone the repository

```bash
git clone https://github.com/Yaso-Moha/ai-career-navigator.git
cd ai-career-navigator
```

### 2. Install dependencies

```bash
meteor npm install
```

### 3. Set environment variables

Export your OpenAI API key before starting:

```bash
export OPENAI_API_KEY="sk-..."
# To persist across terminal sessions:
echo 'export OPENAI_API_KEY="sk-..."' >> ~/.bashrc && exec $SHELL
```

### 4. Start the application

```bash
meteor
```

The app will be available at **http://localhost:3000**

> ⚠️ **Make sure the [resume parser service](https://github.com/Yaso-Moha/resume_parser_service) is running** on `http://localhost:5001` for resume uploads to work.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | [Meteor.js](https://meteor.com) — full‑stack JavaScript platform |
| **Frontend** | React 18, React Router 6, Material UI 7, Emotion |
| **Charts** | Chart.js, Recharts, React‑ChartJS‑2, React‑CountUp |
| **Animations** | Framer Motion |
| **PDF/DOCX** | pdf‑parse, mammoth (client‑side parsing fallback) |
| **Resume Export** | jsPDF, html2canvas |
| **AI / Chatbot** | OpenAI SDK (`openai` npm package) |
| **HTTP Client** | Axios |

---

## 📁 Project Structure

```
ai-career-navigator/
├── client/                    # Meteor client entry
│   ├── main.jsx               # React mount point
│   ├── main.html              # HTML shell
│   └── main.css               # Global styles
├── imports/
│   ├── api/                   # Meteor methods & API helpers
│   │   ├── users.js
│   │   ├── mockInterview.js
│   │   ├── adminMethods.js
│   │   └── links.js           # Backend service URL config
│   ├── data/                  # Static data (salary, questions)
│   └── ui/                    # React components & pages
│       ├── AppWrapper.jsx      # Root component with routing
│       ├── components/         # Shared components (Navbar, Auth, etc.)
│       └── pages/              # Page components
├── public/                    # Static assets & images
├── server/                    # Meteor server
│   ├── main.js                # Server entry, auth, publications
│   └── chatbot.js             # OpenAI chatbot logic
├── package.json
└── settings.json              # Meteor settings
```

---

## 🔑 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | **Yes** | Your OpenAI API key for chatbot, filtering, and recommendations |

---

## 🔗 Backend Service

This app relies on the **Resume Parser Service** for resume processing.  
Make sure to clone and run it alongside:

👉 [**github.com/Yaso-Moha/resume_parser_service**](https://github.com/Yaso-Moha/resume_parser_service)

---

## 🧪 Common Issues

| Problem | Solution |
|---------|----------|
| Chatbot not responding | Make sure `OPENAI_API_KEY` is exported and you restarted your shell (`exec $SHELL`) |
| Resume upload fails | Check that the parser service is running on port 5001 |
| Meteor not found | Install Meteor globally: `npm install -g meteor` or see [meteor.com/developers/install](https://www.meteor.com/developers/install) |

---

## 📜 License

This project is licensed under the **MIT License**. See [LICENSE](./LICENSE) for details.

---

<div align="center">
Made with ❤️ by <a href="https://github.com/Yaso-Moha">Yaso-Moha</a>
</div>