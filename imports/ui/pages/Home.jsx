// imports/ui/pages/Home.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
// Lucide & Feather icons for best modern look
import {
  FileText,
  Download,
  Files,
  ListChecks,
  Mic,
  MessageCircle,
  FileSearch,
  Sparkles
} from 'lucide-react';
import { FiMic } from 'react-icons/fi';


const modules = [
  {
    title: 'Resume Builder',
    path: '/resume-builder',
    // Lucide FileText, blue
    icon: <FileText size={40} color="#2563eb" />,
    description: 'One polished, ATS-friendly template with instant PDF export.',
  },
  {
    title: 'Resume Parser',
    path: '/resume-parser',
    // Lucide FileSearch, orange
    icon: <FileSearch size={40} color="#fbbf24" />,
    description: 'Batch-upload CVs and get AI-powered parsing & shortlisting.',
  },
  {
    title: 'Mock Interview',
    path: '/interview',
    // Lucide Mic, emerald
    icon: <Mic size={40} color="#10b981" />,
    description: 'Voice-enabled practice with AI feedback and downloadable results.',
  },
];

const features = [
  {
    icon: <FileText size={34} color="#2563eb" />,
    title: 'Single Template',
    desc: 'A polished, ATS-friendly design—no customization needed.',
  },
  {
    icon: <Download size={34} color="#f472b6" />, // Pink for PDF export
    title: 'Instant PDF',
    desc: 'Download your finished resume as a PDF in one click.',
  },
  {
    icon: <Files size={34} color="#fbbf24" />, // Orange for batch
    title: 'Batch Parsing',
    desc: 'Process dozens of CVs at once.',
  },
  {
    icon: <ListChecks size={34} color="#a78bfa" />, // Purple for AI shortlist
    title: 'Smart Shortlist',
    desc: 'AI ranks candidates so you see top talent first.',
  },
  {
    icon: <Mic size={34} color="#10b981" />, // Emerald for voice
    title: 'Voice Interview',
    desc: 'Speak your answers & see a live transcript.',
  },
  {
    icon: <MessageCircle size={34} color="#38bdf8" />, // Sky for chatbot
    title: 'Chatbot Advisor',
    desc: 'Get personalized career advice and course suggestions.',
  },
];

const testimonials = [
  {
    text: 'The parser saved me hours of manual screening.',
    author: '— Jason M.',
  },
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      {/* Hero */}
      <div className="background-images">
       <img src="/images/bg1.svg" alt="" className="bg-img bg-img-1" />
       {/* Add more if you want */}
      </div>

      <section className="home-hero">
        <div className="hero-content">
          <h1>Build Your Perfect Resume in Minutes</h1>
          <p>Use our AI-powered platform to create, parse & practice — all in one place.</p>
          <div className="hero-cta">
            <button
              className="button primary-btn"
              onClick={() => navigate('/resume-builder')}
            >
              Get Started
            </button>
            <button
              className="button secondary-btn"
              onClick={() => navigate('/resume-parser')}
            >
              Try Parser
            </button>
          </div>
        </div>
        <div className="hero-image">
          <img
            src="/images/hero-resume.png"
            alt="Resume template preview"
          />
        </div>
      </section>
      

      {/* Platform Highlights */}
      <section className="features-section">
        <h2>Platform Highlights</h2>
        <div className="features-grid">
          {features.map((f) => (
            <div key={f.title} className="feature-card">
              <div className="icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tools Intro Section */}
      <section className="tools-intro-section">
        <h2>Explore Our Tools</h2>
        <p style={{
          color: '#9ca3af',
          fontSize: '1.18rem',
          textAlign: 'center',
          maxWidth: 700,
          margin: '1.5rem auto 2.5rem'
        }}>
          Access professional resume building, powerful parsing, and interactive AI-driven interviews — all on one modern platform.
        </p>
      </section>

      {/* Core Modules */}
      <section className="modules-grid">
        {modules.map((mod) => (
          <article
            key={mod.title}
            className="module-card"
            onClick={() => navigate(mod.path)}
          >
            <div className="icon">{mod.icon}</div>
            <h3>{mod.title}</h3>
            <p>{mod.description}</p>
            <button
              className="button primary-btn"
              onClick={(e) => {
                e.stopPropagation();
                navigate(mod.path);
              }}
            >
              Go to {mod.title}
            </button>
          </article>
        ))}
      </section>

      {/* Testimonial */}
      <section className="testimonials-section">
        <h2>What Our User Say</h2>
        <div className="testimonial-grid">
          {testimonials.map((t, i) => (
            <div key={i} className="testimonial-card">
              <p>“{t.text}”</p>
              <div className="author">{t.author}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <h2>Ready to Elevate Your Career?</h2>
        <button
          className="button primary-btn"
          onClick={() => navigate('/resume-builder')}
        >
          Start Now
        </button>
      </section>
      
    </div>
  );
}
