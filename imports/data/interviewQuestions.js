// imports/data/interviewQuestions.js

// A static question bank for your core roles and experience levels.
// If you request a role/experience not defined below, the server will
// fall back to generating questions via ChatGPT.
export const interviewQuestions = {
    "Software Engineer": {
      "0 years (Fresh Graduate)": [
        "Explain the difference between var, let, and const in JavaScript.",
        "What is a closure in JavaScript and how do you use it?",
        "How does the Node.js event loop work?"
      ],
      "Less than 1 year": [
        "What is the difference between synchronous and asynchronous code in JS?",
        "Describe how Promises work and provide a basic example.",
        "Explain hoisting and its impact in JavaScript."
      ],
      "1-3 years": [
        "How would you optimize performance in a React application?",
        "Explain how the virtual DOM in React works under the hood.",
        "Describe your approach to debugging memory leaks in Node.js."
      ],
      "3-5 years": [
        "How do you design a scalable RESTful API? Which status codes do you use and why?",
        "Explain microservices architecture and its pros/cons.",
        "Walk me through a major refactor you led and what you learned."
      ],
      "5-10 years": [
        "How do you ensure reliability and resilience in a production system?",
        "Describe your experience building CI/CD pipelines.",
        "How have you used container orchestration (e.g. Kubernetes) in past projects?"
      ],
      "10+ years": [
        "How would you lead an engineering organization through a large-scale rewrite?",
        "Discuss trade-offs between SQL and NoSQL persistence layers.",
        "What metrics do you monitor to ensure system health?"
      ]
    },
  
    "Data Scientist": {
      "0 years (Fresh Graduate)": [
        "Define supervised vs. unsupervised learning.",
        "What is overfitting, and how do you prevent it?",
        "Explain a confusion matrix and its key metrics."
      ],
      "Less than 1 year": [
        "How do you handle missing values in a dataset?",
        "Describe the bias–variance trade-off.",
        "What is k-fold cross-validation and why use it?"
      ],
      "1-3 years": [
        "Walk me through building a regression model from raw data.",
        "How do you encode categorical variables for machine learning?",
        "Tell me about a project where you significantly improved model accuracy."
      ],
      "3-5 years": [
        "Explain the difference between bagging and boosting.",
        "How do you deploy a model to production?",
        "Describe how you detect and handle model drift."
      ],
      "5-10 years": [
        "Discuss architecture for real-time data pipelines.",
        "How would you design a recommendation system?",
        "Explain methods for interpreting black-box models."
      ],
      "10+ years": [
        "How do you develop an organization-wide AI/ML strategy?",
        "What ethical considerations do you prioritize in AI projects?",
        "Describe mentoring programs you’ve led for junior data scientists."
      ]
    },
  
    "UI/UX Designer": {
      "0 years (Fresh Graduate)": [
        "What’s the difference between UI and UX?",
        "Explain the importance of user research.",
        "When do you use wireframes vs. prototypes?"
      ],
      "Less than 1 year": [
        "How do you conduct a usability test?",
        "What is a design system and why is it important?",
        "Which tools do you use for prototyping?"
      ],
      "1-3 years": [
        "Walk me through your end-to-end design process for a new feature.",
        "How do you incorporate accessibility into your designs?",
        "Tell me about a time you iterated on a design based on user feedback."
      ],
      "3-5 years": [
        "How do you measure UX success and which metrics do you track?",
        "Describe how you collaborate with developers during implementation.",
        "What’s the toughest design challenge you’ve solved?"
      ],
      "5-10 years": [
        "How do you build and maintain a design system at scale?",
        "Explain your approach to stakeholder alignment on UX decisions.",
        "How have you mentored junior designers?"
      ],
      "10+ years": [
        "What’s your philosophy on balancing aesthetics with usability?",
        "How do you lead UX strategy for multiple products?",
        "Describe a major UX transformation you led."
      ]
    },
  
    "Product Manager": {
      "0 years (Fresh Graduate)": [
        "What is a user story and how do you write one?",
        "Explain Minimum Viable Product (MVP).",
        "What role does a Product Manager play in Agile?"
      ],
      "Less than 1 year": [
        "How do you prioritize features in a backlog?",
        "Describe your process for gathering customer requirements.",
        "Which road-mapping tools do you prefer?"
      ],
      "1-3 years": [
        "How do you measure product success (KPIs)?",
        "Explain how you run a sprint planning session.",
        "Tell me about a feature you launched and its impact."
      ],
      "3-5 years": [
        "How do you balance stakeholder requests and user needs?",
        "Explain your competitive analysis approach.",
        "Describe pivoting a product strategy based on data."
      ],
      "5-10 years": [
        "How do you scale product operations as a company grows?",
        "Discuss frameworks you use (OKRs, etc.).",
        "How have you mentored junior PMs?"
      ],
      "10+ years": [
        "How do you set a multi-year product vision?",
        "Explain aligning cross-functional teams on goals.",
        "Describe a major product transformation you led."
      ]
    },
  
    "HR Specialist": {
      "0 years (Fresh Graduate)": [
        "What are the key responsibilities of an HR Specialist?",
        "Explain the difference between recruitment and talent acquisition.",
        "What is an Applicant Tracking System (ATS)?"
      ],
      "Less than 1 year": [
        "How do you ensure compliance with labor laws?",
        "Describe a time you improved employee engagement.",
        "Which tools do you use for performance management?"
      ],
      "1-3 years": [
        "How do you design training and development programs?",
        "Explain handling confidential employee data.",
        "Describe a conflict resolution you led."
      ],
      "3-5 years": [
        "How do you build a culture of diversity and inclusion?",
        "Explain strategic workforce planning.",
        "Which HR metrics do you track for effectiveness?"
      ],
      "5-10 years": [
        "How do you lead organizational change initiatives?",
        "Describe a major HR transformation you drove.",
        "How have you mentored HR teams?"
      ],
      "10+ years": [
        "What’s your philosophy on talent management at scale?",
        "How do you align HR strategy with business goals?",
        "Explain mentoring senior HR professionals."
      ]
    },
  
    "Financial Analyst": {
      "0 years (Fresh Graduate)": [
        "What financial statements are you familiar with?",
        "Explain revenue vs. profit.",
        "What is working capital?"
      ],
      "Less than 1 year": [
        "How do you perform variance analysis?",
        "Describe a cash flow statement.",
        "What is break-even analysis?"
      ],
      "1-3 years": [
        "How do you build a discounted cash flow (DCF) model?",
        "Explain sensitivity analysis.",
        "Tell me about a cost-saving initiative you led."
      ],
      "3-5 years": [
        "How do you budget and forecast at scale?",
        "Explain handling forecast variances.",
        "Which KPIs track financial performance?"
      ],
      "5-10 years": [
        "How do you lead cross-functional budgeting cycles?",
        "Describe strategic financial planning you drove.",
        "Explain presenting data to non-finance stakeholders."
      ],
      "10+ years": [
        "What’s your approach to capital allocation decisions?",
        "How do you oversee enterprise risk management?",
        "Tell me about mentoring junior analysts."
      ]
    }
  };
  