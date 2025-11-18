import React, { useState, useEffect, useRef } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import FeedbackChart from '/imports/ui/components/FeedbackChart';

// Reusable modern button
function NiceButton({ children, color = '#2563eb', style, ...props }) {
  return (
    <button
      style={{
        background: color,
        color: '#fff',
        fontWeight: 600,
        border: 'none',
        padding: '0.82rem 1.6rem',
        borderRadius: 7,
        fontSize: '1.08rem',
        boxShadow: '0 2px 14px #2563eb24',
        marginTop: 14,
        marginRight: 9,
        cursor: 'pointer',
        transition: 'background .18s',
        ...style
      }}
      {...props}
    >
      {children}
    </button>
  );
}

export default function MockInterview() {
  const user = useTracker(() => Meteor.user());
  const profile = user?.profile;

  const [started, setStarted] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [allFeedback, setAllFeedback] = useState([]);
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [timer, setTimer] = useState(60);
  const [timerActive, setTimerActive] = useState(false);
  const recognitionRef = useRef(null);
  const resultRef = useRef(null);

  // Timer logic
  useEffect(() => {
    if (!timerActive) return;
    if (timer === 0) {
      setTimerActive(false);
      setListening(false);
      recognitionRef.current && recognitionRef.current.stop();
      return;
    }
    const id = setTimeout(() => setTimer((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timer, timerActive]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Your browser does not support voice input.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setAnswer(prev => prev + ' ' + transcript);
      setListening(false);
      setTimerActive(false);
    };

    recognition.onerror = () => {
      setListening(false);
      setTimerActive(false);
    };
    recognition.onend = () => {
      setListening(false);
      setTimerActive(false);
    };

    recognitionRef.current = recognition;
  }, []);

  const startInterview = () => {
    Meteor.call('getMockQuestions', profile, (err, res) => {
      if (!err) {
        setQuestions(res || []);
        setIndex(0);
        setAnswer('');
        setFeedback(null);
        setAllFeedback([]);
        setStarted(true);
      }
    });
  };

  const question = questions[index];

  const submitAnswer = () => {
    setLoading(true);
    setTimerActive(false);
    Meteor.call(
      'getMockFeedback',
      { profile, question, answer },
      (err, res) => {
        setLoading(false);
        if (!err && res) {
          setFeedback(res);
          setAllFeedback([...allFeedback, res]);
        }
      }
    );
  };

  const nextQuestion = () => {
    setIndex((i) => i + 1);
    setAnswer('');
    setFeedback(null);
    setTimer(60);
    setTimerActive(false);
  };

  const totalScore = allFeedback.reduce((acc, fb) => {
    const avg = (fb.scores.clarity + fb.scores.completeness + fb.scores.technical) / 3;
    return acc + avg;
  }, 0);

  const avgScore = allFeedback.length ? (totalScore / allFeedback.length).toFixed(2) : null;

  // For animating feedback section
  const [showFeedback, setShowFeedback] = useState(false);
  useEffect(() => {
    if (feedback) {
      setShowFeedback(false);
      setTimeout(() => setShowFeedback(true), 80);
      // Scroll to feedback
      setTimeout(() => {
        document.getElementById('feedbackSection')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 240);
    }
  }, [feedback]);

  // Animated modern header
  const renderHeader = () => (
    <div style={{
      width: '100%',
      maxWidth: 760,
      margin: '0 auto 2.5rem auto',
      textAlign: 'center',
      padding: '2.5rem 0 2rem 0',
      borderRadius: '20px',
      background: 'linear-gradient(90deg,#6366f1 0%,#0ea5e9 100%)',
      color: '#fff',
      boxShadow: '0 4px 24px #3b82f640',
      position: 'relative'
    }}>
      <span style={{ fontSize: 42, marginBottom: 12, display: 'inline-block' }}>🧑‍💼</span>
      <h1 style={{ fontWeight: 700, fontSize: '2.2rem', letterSpacing: '0.02em', marginBottom: 0 }}>Mock Interview</h1>
      <div style={{
        margin: '0 auto', marginTop: 12, width: 80, height: 5, borderRadius: 12,
        background: 'linear-gradient(90deg,#10b981 10%,#6366f1 100%)',
        boxShadow: '0 2px 12px #10b98160'
      }} />
      <div style={{ color: '#e0e7ef', marginTop: 12 }}>Practice, get instant AI feedback, and boost your interview skills!</div>
    </div>
  );

  // Progress Bar
  const renderProgress = () =>
    started && questions.length > 0 && (
      <div style={{ height: 9, width: '100%', background: '#374151', borderRadius: 6, marginBottom: 18 }}>
        <div style={{
          width: `${((index + 1) / questions.length) * 100}%`,
          height: '100%',
          background: 'linear-gradient(90deg,#10b981 20%,#6366f1 100%)',
          borderRadius: 6,
          transition: 'width 0.4s'
        }} />
      </div>
    );

  // Voice animation
  const renderMicAnimation = () => (
    <div style={{
      marginTop: 14,
      marginBottom: 5,
      display: 'flex',
      alignItems: 'center',
      gap: 9
    }}>
      <span style={{
        width: 16,
        height: 16,
        borderRadius: '50%',
        background: listening ? 'radial-gradient(#38bdf8 60%,#22d3ee 100%)' : '#222',
        boxShadow: listening ? '0 0 12px #38bdf888, 0 0 24px #38bdf822' : 'none',
        display: 'inline-block',
        animation: listening ? 'pulse 0.88s infinite alternate' : 'none'
      }} />
      <span style={{ color: '#fbbf24', fontWeight: 500 }}>
        {listening ? "Listening..." : ""}
      </span>
      <style>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 8px #38bdf8, 0 0 16px #38bdf822;}
          100% { box-shadow: 0 0 32px #38bdf8, 0 0 48px #38bdf844;}
        }
      `}</style>
    </div>
  );

  // Main Render
  return (
    <div style={styles.pageWithImage}>
      <div style={styles.overlay} />
      <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: 760, margin: '0 auto' }}>
        {renderHeader()}
        {!started ? (
          <div style={styles.card}>
            <h2 style={{ marginTop: 0 }}>🎤 Welcome to Your AI Mock Interview</h2>
            <ul style={{
              color: '#cbd5e1', fontSize: '1.03rem', marginBottom: '1.1rem',
              lineHeight: 1.7, marginTop: 0, paddingLeft: 22
            }}>
              <li>Practice with <b>real interview questions</b> matched to your profile.</li>
              <li>Answer by <b>typing or using your voice</b> (microphone required).</li>
              <li>Get <b>instant AI feedback and scoring</b> on every answer.</li>
              <li>You can <b>download or copy your results</b> at the end.</li>
            </ul>
            <div style={{
              color: '#cbd5e1',
              marginBottom: 14,
              fontSize: '1rem',
              background: '#111827',
              borderRadius: 7,
              padding: '0.88rem 1.12rem'
            }}>
              <b>Your Profile:</b> <br />
              Career: <span style={{ color: '#10b981' }}>{profile?.career ?? '–'}</span>, &nbsp;
              Experience: <span style={{ color: '#10b981' }}>{profile?.experience ?? '–'}</span>, &nbsp;
              Education: <span style={{ color: '#10b981' }}>{profile?.education ?? '–'}</span>
            </div>
            <NiceButton onClick={startInterview}>
              Start Interview
            </NiceButton>
            <div style={{ color: '#fbbf24', fontSize: '.95rem', marginTop: 12 }}>
              ⚠️ Make sure your browser has microphone access enabled for voice input.
            </div>
          </div>
        ) : index >= questions.length ? (
          <div style={{ ...styles.card, textAlign: 'center' }}>
            <div ref={resultRef}>
              <h2 style={{ marginBottom: 8 }}>✅ Interview Completed!</h2>
              <div style={{
                fontSize: '1.35rem',
                fontWeight: 600,
                color: '#10b981',
                marginBottom: 7
              }}>
                Average Score: {avgScore}/5
              </div>
              <FeedbackChart feedback={allFeedback} />
            </div>

            <div style={{ marginTop: 22, marginBottom: 8, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 13 }}>
              <NiceButton
                color="#ef4444"
                onClick={async () => {
                  const input = resultRef.current;
                  const canvas = await html2canvas(input, { scale: 2 });
                  const imgData = canvas.toDataURL('image/png');
                  const pdf = new jsPDF('p', 'mm', 'a4');
                  const width = pdf.internal.pageSize.getWidth();
                  const height = (canvas.height * width) / canvas.width;
                  pdf.addImage(imgData, 'PNG', 0, 0, width, height);
                  pdf.save('mock_interview_result.pdf');
                }}
              >
                🖨️ Download as PDF
              </NiceButton>

              <NiceButton
                color="#10b981"
                onClick={() => {
                  const result = allFeedback.map((fb, i) => ({
                    question: questions[i],
                    scores: fb.scores,
                    feedback: fb.feedback
                  }));
                  const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'mock_interview_result.json';
                  a.click();
                }}
              >
                💾 Download JSON
              </NiceButton>

              <NiceButton
                color="#6366f1"
                onClick={() => {
                  const summary = allFeedback.map((fb, i) =>
                    `Q${i + 1}: ${questions[i]}\nClarity: ${fb.scores.clarity}, Completeness: ${fb.scores.completeness}, Technical: ${fb.scores.technical}\nFeedback: ${fb.feedback.join(', ')}\n`
                  ).join('\n');
                  navigator.clipboard.writeText(summary);
                  alert('Summary copied to clipboard! You can now share it anywhere.');
                }}
              >
                📋 Copy Summary
              </NiceButton>
            </div>
            <NiceButton color="#475569" onClick={() => setStarted(false)}>
              Restart
            </NiceButton>
          </div>
        ) : (
          <div style={styles.card}>
            {renderProgress()}
            <h3 style={{ marginTop: 0, marginBottom: 0 }}>Question {index + 1} of {questions.length}</h3>
            <p style={{
              color: '#fbbf24',
              marginTop: 4,
              marginBottom: 12,
              fontSize: '1.16rem',
              fontWeight: 600,
              lineHeight: 1.45
            }}>
              {question}
            </p>
            <div style={{ fontSize: '1.08rem', color: '#94a3b8', marginBottom: 5 }}>
              You can type or <b>use your voice</b> to answer.
            </div>
            {!feedback && (
              <>
                <textarea
                  style={styles.textarea}
                  placeholder="Write your answer..."
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <NiceButton
                    color={listening ? '#f59e0b' : '#10b981'}
                    type="button"
                    style={{
                      fontWeight: listening ? 700 : 600,
                      boxShadow: listening ? '0 0 14px #fbbf2430' : undefined,
                      transition: 'all .22s'
                    }}
                    onClick={() => {
                      if (recognitionRef.current) {
                        setListening(true);
                        setTimer(60);
                        setTimerActive(true);
                        recognitionRef.current.start();
                      }
                    }}
                    disabled={listening}
                  >
                    {listening ? 'Listening...' : '🎙️ Speak Answer'}
                  </NiceButton>
                  <NiceButton
                    style={{ fontWeight: 700 }}
                    onClick={submitAnswer}
                    disabled={!answer || loading}
                  >
                    {loading ? "Analyzing..." : "Submit Answer"}
                  </NiceButton>
                  {/* Timer visual */}
                  {timerActive && (
                    <span style={{
                      background: timer < 10 ? '#ef4444' : '#1e293b',
                      color: '#fff',
                      fontWeight: 700,
                      borderRadius: 7,
                      padding: '0.5rem 1.2rem',
                      fontSize: '1.08rem',
                      marginLeft: 10,
                      transition: 'background .2s'
                    }}>
                      {timer}s
                    </span>
                  )}
                </div>
                {renderMicAnimation()}
              </>
            )}

            {/* Animated feedback */}
            {feedback && (
              <div
                id="feedbackSection"
                style={{
                  ...styles.feedback,
                  marginTop: '1.7rem',
                  animation: showFeedback ? 'fadeInUp .62s' : 'none'
                }}
              >
                <style>{`
                  @keyframes fadeInUp {
                    0% { opacity: 0; transform: translateY(42px);}
                    100% { opacity: 1; transform: translateY(0);}
                  }
                `}</style>
                <p style={{ fontWeight: 600, marginBottom: 7, fontSize: '1.1rem', color: '#10b981' }}>AI Feedback</p>
                <ul style={{ listStyle: 'none', paddingLeft: 0, marginBottom: 7 }}>
                  <li>
                    <strong>Clarity:</strong> <span style={{ color: '#60a5fa' }}>{feedback.scores.clarity}/5</span>
                  </li>
                  <li>
                    <strong>Completeness:</strong> <span style={{ color: '#34d399' }}>{feedback.scores.completeness}/5</span>
                  </li>
                  <li>
                    <strong>Technical:</strong> <span style={{ color: '#f87171' }}>{feedback.scores.technical}/5</span>
                  </li>
                </ul>
                <div style={{
                  background: '#172031',
                  borderRadius: 7,
                  padding: '1.0rem',
                  fontSize: '1.07rem',
                  color: '#f3f4f6'
                }}>
                  {feedback.feedback.map((f, i) => (
                    <div key={i} style={{ marginBottom: 5, display: 'flex', alignItems: 'center', gap: 7 }}>
                      <span style={{ fontSize: 17, color: '#38bdf8' }}>💡</span>
                      {f}
                    </div>
                  ))}
                </div>
                <NiceButton color="#6366f1" style={{ marginTop: 18 }} onClick={nextQuestion}>
                  Next Question
                </NiceButton>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  pageWithImage: {
    minHeight: '100vh',
    background:
      `linear-gradient(135deg, #1a2236 0%, #1f2a38 100%)`,
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center center',
    position: 'relative',
    zIndex: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    padding: '2rem'
  },
  overlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.70)',
    zIndex: 0
  },
  card: {
    backgroundColor: '#1f2937',
    color: '#f9fafb',
    padding: '2.1rem 2.3rem',
    borderRadius: '14px',
    maxWidth: '730px',
    width: '100%',
    boxShadow: '0 0 28px rgba(0,0,0,0.28)',
    position: 'relative',
    zIndex: 1,
    margin: '0 auto 1.2rem auto'
  },
  textarea: {
    width: '100%',
    padding: '1rem',
    minHeight: '120px',
    borderRadius: '7px',
    marginTop: '1rem',
    marginBottom: '1rem',
    fontSize: '1.03rem',
    fontFamily: 'Inter, sans-serif',
    backgroundColor: '#111827',
    color: '#f9fafb',
    border: '1px solid #374151'
  },
  feedback: {
    backgroundColor: '#0e1726',
    padding: '1.35rem 1.5rem',
    borderRadius: 10,
    marginTop: '2rem',
    boxShadow: '0 2px 14px #10b98125'
  }
};
