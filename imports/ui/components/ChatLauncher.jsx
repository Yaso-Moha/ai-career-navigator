// imports/ui/components/ChatLauncher.jsx

import React, { useState, useRef, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';

const CHAT_HISTORY_KEY = 'careerAdvisorChatHistory';

export default function ChatLauncher() {
  const [isOpen, setIsOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [botThinking, setBotThinking] = useState(false);
  const [evalMode, setEvalMode] = useState('profile');
  const fileInputRef = useRef(null);

  // Meteor user for avatar/profile context
  const user = useTracker(() => Meteor.user(), []);

  // Clear chat messages and localStorage on logout
  useEffect(() => {
    if (!user) {
      setMessages([]);
      localStorage.removeItem(CHAT_HISTORY_KEY);
    }
  }, [user]);

  const messagesEndRef = useRef(null);

  // Restore chat history from localStorage
  useEffect(() => {
    if (isOpen) {
      const saved = localStorage.getItem(CHAT_HISTORY_KEY);
      if (saved) setMessages(JSON.parse(saved));
      else setMessages([{
        from: 'bot',
        text: `👋 Hello! I'm your Career Advisor.\n\n• Ask about courses or skills to improve (using your profile).\n• Or upload your CV (PDF/Word) to get personalized suggestions.\n\nChoose an evaluation mode to get started.`
      }]);
    }
  }, [isOpen]);

  // Save chat history to localStorage
  useEffect(() => {
    if (isOpen) localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
  }, [messages, isOpen]);

  // Scroll to bottom on new message
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isOpen, minimized]);

  // Toggle open/minimize
  const toggleOpen = () => {
    setIsOpen(v => !v);
    setMinimized(false);
  };
  const toggleMinimize = () => setMinimized(v => !v);

  // Meteor.call promise utility
  const callMethodPromise = (methodName, args) =>
    new Promise((resolve, reject) =>
      Meteor.call(methodName, args, (err, result) => err ? reject(err) : resolve(result))
    );

  // Render message text with clickable links
  const renderMessageText = (text) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const lines = text.split('\n');
    return lines.map((line, lineIdx) => {
      const parts = line.split(urlRegex);
      return (
        <div key={`line-${lineIdx}`} style={{ marginBottom: '0.5rem' }}>
          {parts.map((part, idx) =>
            urlRegex.test(part) ? (
              <a
                key={`link-${lineIdx}-${idx}`}
                href={part}
                target="_blank"
                rel="noreferrer"
                style={{ color: '#2563eb', textDecoration: 'underline', wordBreak: 'break-all' }}
              >
                {part.length > 36 ? part.slice(0, 33) + '...' : part}
              </a>
            ) : (
              <span key={`text-${lineIdx}-${idx}`}>{part}</span>
            )
          )}
        </div>
      );
    });
  };

  // Send user message (profile mode)
  const sendTextMessage = async () => {
    const trimmed = inputText.trim();
    if (!trimmed) return;
    setMessages(prev => [...prev, { from: 'user', text: trimmed }]);
    setInputText('');
    if (evalMode === 'profile') {
      // Expanded keyword pattern to detect more variations (case insensitive)
      const keywordPattern = /\b(course|courses|skill|skills|Skill|Skills|improve|career|learn|develop|advance|profisional|suggest|Suggest|upgrade|Upgrade)\b/i;
      if (!keywordPattern.test(trimmed)) {
        setMessages(prev => [...prev, { from: 'bot', text: '❗️ Please ask a question about courses, skills to improve, or career guidance.' }]);
        return;
      }
      setBotThinking(true);
      try {
        const botReply = await callMethodPromise('chatbot.fromProfile', {
          question: trimmed, userProfile: user?.profile || {}
        });
        setMessages(prev => [...prev, { from: 'bot', text: botReply }]);
      } catch (err) {
        setMessages(prev => [...prev, { from: 'bot', text: '❗️ Sorry, there was an error processing your request. Please try again.' }]);
      }
      setBotThinking(false);
    }
  };

  // File upload (resume mode)
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ];
    if (!allowedTypes.includes(file.type)) {
      setMessages(prev => [...prev, { from: 'bot', text: '❗️ Unsupported file type. Please upload a PDF or Word document.' }]);
      return;
    }
    setUploading(true);
    setMessages(prev => [...prev, { from: 'user', text: `Uploading ${file.name}…` }]);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Data = event.target.result;
      try {
        setBotThinking(true);
        const botReply = await callMethodPromise('chatbot.processResume', {
          base64: base64Data, filename: file.name
        });
        setMessages(prev => [...prev, { from: 'bot', text: botReply }]);
      } catch (err) {
        setMessages(prev => [...prev, { from: 'bot', text: '❗️ An unexpected error occurred. Please try again.' }]);
      }
      setUploading(false);
      setBotThinking(false);
    };
    reader.readAsDataURL(file);
  };

  // --- COMPONENT RENDER ---
  return (
    <>
      <div style={{
        position: 'fixed', bottom: '1rem', right: '1rem', zIndex: 2000, display: 'flex',
        flexDirection: 'column', alignItems: 'flex-end'
      }}>
        {isOpen && !minimized && (
          <div style={{
            width: '410px', height: '550px', backgroundColor: '#fff',
            boxShadow: '0px 4px 16px rgba(0,0,0,0.20)', borderRadius: '10px',
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
            animation: 'fadeInUp 0.32s cubic-bezier(.23,1.4,.42,1.13)', marginBottom: '0.5rem'
          }}>
            {/* HEADER */}
            <div style={{
              backgroundColor: '#2563eb', color: '#fff', padding: '0.75rem',
              display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative'
            }}>
              <span style={{ fontWeight: '500', fontSize: '1.1rem' }}>Career Advisor</span>
              <button onClick={toggleMinimize} style={{
                background: 'none', border: 'none', color: '#fff', fontSize: '1.2rem',
                cursor: 'pointer', position: 'absolute', right: '2.2rem'
              }} aria-label="Minimize chat window">–</button>
              <button onClick={toggleOpen} style={{
                background: 'none', border: 'none', color: '#fff', fontSize: '1.2rem',
                cursor: 'pointer', position: 'absolute', right: '0.75rem'
              }} aria-label="Close chat window">×</button>
            </div>

            {/* DROPDOWN */}
            <div style={{
              padding: '0.5rem 0.75rem', backgroundColor: '#f3f4f6',
              display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: '0.5rem',
              fontSize: '0.97rem', borderBottom: '1px solid #e5e7eb'
            }}>
              <label htmlFor="evalMode" style={{ fontWeight: '500', color: '#374151' }}>Evaluate using:</label>
              <select id="evalMode" value={evalMode} onChange={e => setEvalMode(e.target.value)} style={{
                padding: '0.39rem 1.1rem 0.39rem 0.5rem', borderRadius: '6px', border: '1px solid #2563eb',
                fontSize: '0.96rem', backgroundColor: '#fff', color: '#2563eb',
                fontWeight: '500', outline: 'none', cursor: 'pointer'
              }}>
                <option value="profile" style={{ color: '#000' }}>Profile</option>
                <option value="resume" style={{ color: '#000' }}>Resume</option>
              </select>
            </div>

            {/* MESSAGE HISTORY */}
            <div style={{
              flex: 1, padding: '0.75rem', overflowY: 'auto', backgroundColor: '#f8fafc'
            }}>
              {messages.map((msg, idx) => (
                <div key={idx} style={{
                  marginBottom: '0.75rem', display: 'flex', alignItems: 'flex-end',
                  flexDirection: msg.from === 'user' ? 'row-reverse' : 'row'
                }}>
                  {/* Avatar */}
                  <div style={{
                    width: 30, height: 30, borderRadius: '50%', margin: '0 7px',
                    background: msg.from === 'user' ? '#6366f1' : '#0ea5e9', color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 17, fontWeight: 'bold', flexShrink: 0
                  }}>
                    {msg.from === 'user'
                      ? (user?.profile?.avatar
                        ? <img src={user.profile.avatar} alt="avatar" style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
                        : <span>🧑</span>)
                      : <span>🤖</span>
                    }
                  </div>
                  <div style={{
                    display: 'inline-block', backgroundColor: msg.from === 'user' ? '#2563eb' : '#e5e7eb',
                    color: msg.from === 'user' ? '#fff' : '#111827', borderRadius: '12px',
                    padding: '0.61rem 0.93rem', maxWidth: '83%', wordBreak: 'break-word', fontSize: '0.98rem'
                  }}>
                    {renderMessageText(msg.text)}
                  </div>
                </div>
              ))}
              {botThinking &&
                <div style={{ marginBottom: '0.65rem', display: 'flex', alignItems: 'center', color: '#0ea5e9', fontWeight: 500 }}>
                  <span style={{ fontSize: 20, marginRight: 5 }}>🤖</span>
                  <span>Thinking<span className="dot-dot-dot">...</span></span>
                </div>
              }
              <div ref={messagesEndRef} />
            </div>

            {/* INPUT / UPLOAD */}
            <div style={{
              padding: '0.7rem', borderTop: '1px solid #e5e7eb',
              display: 'flex', alignItems: 'center', gap: '0.45rem', backgroundColor: '#fff'
            }}>
              {/* Text input (Profile mode) */}
              <input
                type="text"
                value={inputText}
                disabled={evalMode === 'resume' || uploading}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && evalMode === 'profile') sendTextMessage(); }}
                placeholder={
                  evalMode === 'profile'
                    ? 'Ask about courses or skills…'
                    : 'Switch to Profile mode to type…'
                }
                style={{
                  flex: 1, padding: '0.56rem', borderRadius: '4px', border: '1px solid #d1d5db',
                  fontSize: '0.98rem', backgroundColor: evalMode === 'resume' ? '#e5e7eb' : '#fff',
                  cursor: evalMode === 'resume' ? 'not-allowed' : 'text'
                }}
                aria-label="Type your question"
              />
              {/* Hidden file input (Resume mode) */}
              <input type="file" accept=".pdf,.docx" style={{ display: 'none' }} ref={fileInputRef} onChange={handleFileChange} />
              {/* “Upload CV” button (Resume mode) */}
              <button
                onClick={() => fileInputRef.current.click()}
                disabled={evalMode === 'profile' || uploading}
                style={{
                  backgroundColor: evalMode === 'profile' || uploading ? '#9ca3af' : '#2563eb',
                  color: '#fff', border: 'none', borderRadius: '4px', padding: '0.51rem 0.91rem',
                  fontSize: '0.93rem', cursor: evalMode === 'profile' || uploading ? 'not-allowed' : 'pointer'
                }}
                title={evalMode === 'profile' ? 'Switch to Resume mode to upload' : 'Upload your resume (PDF or DOCX)'}
              >{uploading ? 'Uploading…' : 'Upload CV'}</button>
              {/* “Send” button (Profile mode) */}
              <button
                onClick={sendTextMessage}
                disabled={evalMode === 'resume' || uploading || !inputText.trim()}
                style={{
                  backgroundColor: evalMode === 'resume' || uploading || !inputText.trim() ? '#9ca3af' : '#10b981',
                  color: '#fff', border: 'none', borderRadius: '4px', padding: '0.51rem 0.91rem',
                  fontSize: '0.93rem', cursor: evalMode === 'resume' || uploading || !inputText.trim() ? 'not-allowed' : 'pointer'
                }}
                title={evalMode === 'resume' ? 'Switch to Profile mode to send a question' : 'Send Question'}
              >Send</button>
            </div>
          </div>
        )}
        {isOpen && minimized && (
          <div style={{
            background: '#2563eb', color: '#fff', width: 220, height: 40, borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            boxShadow: '0 1px 8px #232e4455', padding: '0 1.1rem', marginBottom: '0.5rem'
          }}>
            <span style={{ fontWeight: 500, fontSize: 15 }}>Career Advisor</span>
            <div>
              <button onClick={toggleMinimize} style={{
                background: 'none', border: 'none', color: '#fff', fontSize: '1.17rem', marginRight: 6, cursor: 'pointer'
              }} aria-label="Expand chat window">⤢</button>
              <button onClick={toggleOpen} style={{
                background: 'none', border: 'none', color: '#fff', fontSize: '1.15rem', cursor: 'pointer'
              }} aria-label="Close chat window">×</button>
            </div>
          </div>
        )}
        {/* Floating “💬” button */}
        {!isOpen &&
          <button onClick={toggleOpen} style={{
            width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#2563eb',
            border: 'none', color: '#fff', fontSize: '1.52rem', cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }} aria-label="Open chat window">💬</button>
        }
      </div>
      {/* Keyframes */}
      <style>
        {`
          @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to   { opacity: 1; transform: translateY(0); } }
          .dot-dot-dot::after { content: '...'; animation: dots 1.2s steps(3, end) infinite; }
          @keyframes dots { 0%, 20% { color: rgba(14,165,233,0); } 40% { color: #0ea5e9; } 100% { color: #0ea5e9; } }
        `}
      </style>
    </>
  );
}
