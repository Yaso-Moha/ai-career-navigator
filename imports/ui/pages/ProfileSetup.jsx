import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';
import { useNavigate } from 'react-router-dom';
import { FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

const CAREERS = [
  "Software Engineer", "Data Scientist", "UI/UX Designer", "Product Manager", "Web Developer",
  "Mobile Developer", "Systems Analyst", "Network Engineer", "Cybersecurity Specialist",
  "Cloud Engineer", "IT Support Specialist", "Project Manager", "Business Analyst",
  "Marketing Specialist", "Digital Marketer", "Sales Executive", "Graphic Designer",
  "Content Writer", "HR Specialist", "Financial Analyst", "Accountant", "Teacher", "Nurse",
  "Doctor", "Mechanical Engineer", "Civil Engineer", "Electrician", "Plumber", "Chef",
  "Customer Service Representative", "Lawyer"
];

const EXPERIENCE = [
  "0 years (Fresh Graduate)", "Less than 1 year", "1–3 years", "3–5 years", "5–10 years", "10+ years"
];

const EDUCATION = [
  "High School", "Diploma", "Associate Degree", "Bachelor's Degree", "Master's Degree", "PhD"
];

const LOCATIONS = [
  "Malaysia", "Saudi Arabia", "United Arab Emirates", "Qatar", "USA", "UK", "Germany",
  "Canada", "India", "Indonesia", "Philippines", "Australia", "Singapore", "Remote", "Japan", "China", "France"
];

const GENDERS = ['Male', 'Female', 'Other'];

export default function ProfileSetup() {
  const navigate = useNavigate();

  const [gender, setGender] = useState('');
  const [career, setCareer] = useState('');
  const [experience, setExperience] = useState('');
  const [education, setEducation] = useState('');
  const [location, setLocation] = useState('');
  const [github, setGithub] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // For progress bar: count required fields
  const required = [gender, career, experience, education, location];
  const progress = Math.round((required.filter(Boolean).length / required.length) * 100);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!gender || !career || !experience || !education || !location) {
      setError('Please fill in all required fields.');
      return;
    }

    Meteor.call(
      'updateJobSeekerProfile',
      { gender, career, experience, education, location, github, linkedin },
      (err) => {
        if (err) {
          setError(err.message || 'Error saving profile');
        } else {
          setSuccess('Profile saved! Redirecting...');
          setTimeout(() => navigate('/resume-parser'), 1200);
        }
      }
    );
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2 style={titleStyle}>🎯 <span style={{ color: '#38bdf8' }}>Complete Your Profile</span></h2>
        <div style={{ marginBottom: 18 }}>
          <div style={progressBgStyle}>
            <div style={{
              ...progressStyle,
              width: `${progress}%`,
              background: progress === 100
                ? 'linear-gradient(90deg,#22c55e,#4ade80)'
                : 'linear-gradient(90deg,#60a5fa,#6366f1)'
            }} />
          </div>
          <span style={{
            fontSize: '.99rem',
            color: progress === 100 ? '#22c55e' : '#60a5fa',
            fontWeight: 500,
            display: 'block',
            marginTop: 3,
            marginLeft: 3
          }}>
            {progress === 100 ? 'Profile Complete!' : `Profile ${progress}% complete`}
          </span>
        </div>
        <div style={dividerStyle} />
        <form onSubmit={handleSubmit} autoComplete="off">
          <Dropdown label="Gender" options={GENDERS} value={gender} setValue={setGender} required />
          <Dropdown label="Career / Role" options={CAREERS} value={career} setValue={setCareer} required />
          <Dropdown label="Years of Experience" options={EXPERIENCE} value={experience} setValue={setExperience} required />
          <Dropdown label="Education Level" options={EDUCATION} value={education} setValue={setEducation} required />
          <Dropdown label="Location (Country)" options={LOCATIONS} value={location} setValue={setLocation} required />
          <Input label="GitHub (username or URL) (optional)" value={github} setValue={setGithub} placeholder="e.g. github.com/yourhandle" />
          <Input label="LinkedIn (username or URL) (optional)" value={linkedin} setValue={setLinkedin} placeholder="e.g. linkedin.com/in/yourhandle" />

          <div style={{ minHeight: 32, margin: '10px 0 3px 0' }}>
            {error &&
              <div style={errorAlertStyle}><FiAlertCircle style={{ marginRight: 7, fontSize: 19 }} />{error}</div>
            }
            {success &&
              <div style={successAlertStyle}><FiCheckCircle style={{ marginRight: 7, fontSize: 19 }} />{success}</div>
            }
          </div>
          <button
            type="submit"
            style={buttonStyle}
            disabled={progress < 100}
          >Save & Continue</button>
        </form>
      </div>
    </div>
  );
}

function Input({ label, value, setValue, placeholder }) {
  return (
    <div style={{ marginBottom: '1.1rem' }}>
      <label style={{ display: 'block', marginBottom: '0.33rem', color: '#e0e7ef', fontWeight: 500 }}>{label}</label>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => setValue(e.target.value)}
        style={inputStyle}
        autoComplete="off"
      />
    </div>
  );
}

function Dropdown({ label, options, value, setValue, required }) {
  return (
    <div style={{ marginBottom: '1.1rem' }}>
      <label style={{ display: 'block', marginBottom: '0.33rem', color: '#e0e7ef', fontWeight: 500 }}>
        {label} {required && <span style={{ color: 'salmon' }}>*</span>}
      </label>
      <select
        value={value}
        required={required}
        onChange={(e) => setValue(e.target.value)}
        style={selectStyle}
      >
        <option value="">-- Select --</option>
        {options.map((opt, i) => (
          <option key={i} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}

// Styles
const containerStyle = {
  minHeight: '100vh',
  background: `linear-gradient(135deg, #1a2236 0%, #1f2a38 100%), url('/images/haikei-bg.svg') repeat`,
  backgroundSize: 'cover',
  backgroundBlendMode: 'overlay',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '3vw'
};
const cardStyle = {
  width: '100%',
  maxWidth: 430,
  background: 'rgba(30, 41, 59, 0.97)',
  borderRadius: 18,
  boxShadow: '0 8px 32px 0 rgba(31,41,55,0.19)',
  padding: '2.2rem 2.5rem 2.7rem 2.5rem',
  margin: '3rem auto 2rem auto'
};
const titleStyle = {
  fontSize: '2rem',
  fontWeight: 700,
  marginBottom: '0.5rem',
  textAlign: 'center',
  letterSpacing: '0.01em'
};
const dividerStyle = {
  borderTop: '1.3px solid #27304c',
  width: '100%',
  margin: '15px 0 20px 0'
};
const progressBgStyle = {
  width: '100%',
  height: 10,
  background: '#232e44',
  borderRadius: 8,
  marginBottom: 0
};
const progressStyle = {
  height: 10,
  borderRadius: 8,
  transition: 'width 0.7s cubic-bezier(0.23, 1, 0.32, 1)'
};
const inputStyle = {
  width: '100%',
  padding: '0.7rem',
  borderRadius: '7px',
  border: '1.2px solid #27304c',
  backgroundColor: '#2d384b',
  color: '#e0e7ef',
  fontSize: '1.07rem',
  outline: 'none',
  marginTop: 2,
  boxSizing: 'border-box'
};
const selectStyle = {
  width: '100%',
  padding: '0.7rem',
  borderRadius: '7px',
  border: '1.2px solid #27304c',
  backgroundColor: '#2d384b',
  color: '#e0e7ef',
  fontSize: '1.07rem',
  outline: 'none',
  marginTop: 2,
  boxSizing: 'border-box'
};
const buttonStyle = {
  marginTop: '1.5rem',
  background: 'linear-gradient(90deg,#6366f1 60%,#22d3ee 100%)',
  color: '#fff',
  border: 'none',
  padding: '0.85rem 2.2rem',
  borderRadius: '7px',
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: '1.07rem',
  boxShadow: '0 4px 12px #232e4455',
  letterSpacing: '.01em',
  transition: 'background .14s,transform .15s'
};
const errorAlertStyle = {
  color: '#ef4444',
  background: 'rgba(239,68,68,0.12)',
  border: '1.4px solid #ef444466',
  borderRadius: 7,
  padding: '0.65rem 1.2rem',
  display: 'flex',
  alignItems: 'center',
  fontWeight: 500,
  fontSize: '1.07rem',
  margin: '0.5rem 0 0.2rem 0'
};
const successAlertStyle = {
  color: '#22c55e',
  background: 'rgba(34,197,94,0.13)',
  border: '1.4px solid #22c55e55',
  borderRadius: 7,
  padding: '0.65rem 1.2rem',
  display: 'flex',
  alignItems: 'center',
  fontWeight: 500,
  fontSize: '1.07rem',
  margin: '0.5rem 0 0.2rem 0'
};
