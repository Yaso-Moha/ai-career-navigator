import React, { useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { FiEdit2, FiTrash2, FiCheckCircle, FiAlertCircle, FiUpload } from 'react-icons/fi';

const CAREERS = [
  "Software Engineer", "Data Scientist", "UI/UX Designer", "Product Manager", "Web Developer",
  "Mobile Developer", "Systems Analyst", "Network Engineer", "Cybersecurity Specialist",
  "Cloud Engineer", "IT Support Specialist", "Project Manager", "Business Analyst",
  "Marketing Specialist", "Digital Marketer", "Sales Executive", "Graphic Designer",
  "Content Writer", "HR Specialist", "Financial Analyst", "Accountant", "Teacher",
  "Nurse", "Doctor", "Mechanical Engineer", "Civil Engineer", "Electrician", "Plumber",
  "Chef", "Customer Service Representative", "Lawyer"
];
const EXPERIENCE = [
  "0 years (Fresh Graduate)", "Less than 1 year", "1-3 years", "3-5 years", "5-10 years", "10+ years"
];
const EDUCATION = [
  "High School", "Diploma", "Associate Degree", "Bachelor's Degree", "Master's Degree", "PhD"
];
const LOCATIONS = [
  "Malaysia", "Saudi Arabia", "United Arab Emirates", "Qatar", "USA", "UK", "Germany", "Canada",
  "India", "Indonesia", "Philippines", "Australia", "Singapore", "Remote", "Japan", "China", "France"
];
const GENDERS = ["Male", "Female"];

export default function ProfilePage() {
  const user = useTracker(() => Meteor.user(), []);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    gender: '', career: '', experience: '', education: '', location: '', industry: '', avatar: ''
  });
  const [avatarPreview, setAvatarPreview] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loadingAvatar, setLoadingAvatar] = useState(false);

  // Profile completion calculation
  const requiredFields = ['gender', 'career', 'experience', 'education', 'location', 'avatar'];
  const filledCount = requiredFields.filter(f => !!form[f]).length;
  const progress = Math.round((filledCount / requiredFields.length) * 100);

  useEffect(() => {
    if (user && user.profile) {
      const p = user.profile;
      setForm({
        gender: p.gender || '', career: p.career || '', experience: p.experience || '',
        education: p.education || '', location: p.location || '', industry: p.industry || '', avatar: p.avatar || ''
      });
      setAvatarPreview(p.avatar || '');
    }
  }, [user]);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setError('');
    setSuccess('');
  };

  // Avatar upload logic (with drag & drop)
  const handleAvatarChange = e => {
    const file = e.target.files[0];
    if (!file) return;
    setLoadingAvatar(true);
    if (!file.type.startsWith('image/')) {
      setError('Only image files (jpg/png) allowed');
      setLoadingAvatar(false);
      return;
    }
    if (file.size > 1024 * 1024) {
      setError('Image must be under 1MB');
      setLoadingAvatar(false);
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const b64 = reader.result;
      setAvatarPreview(b64);
      handleChange('avatar', b64);
      setLoadingAvatar(false);
    };
    reader.readAsDataURL(file);
  };

  // Avatar remove
  const handleRemoveAvatar = () => {
    setAvatarPreview('');
    handleChange('avatar', '');
    setSuccess('');
  };

  // Save logic
  const handleSave = e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    // Validate required fields
    for (let key of requiredFields) {
      if (!form[key]) {
        setError(`Please fill in your ${key === 'avatar' ? 'profile picture' : key}.`);
        return;
      }
    }
    Meteor.users.update(
      { _id: user._id },
      {
        $set: {
          'profile.gender': form.gender,
          'profile.career': form.career,
          'profile.experience': form.experience,
          'profile.education': form.education,
          'profile.location': form.location,
          'profile.industry': form.industry,
          'profile.avatar': form.avatar
        }
      },
      err => {
        if (err) setError(err.reason || 'Error updating profile');
        else {
          setSuccess('Profile updated successfully!');
          setEditMode(false);
        }
      }
    );
  };

  if (!user || !form) {
    return <p style={{ padding: '2rem' }}>Loading profile...</p>;
  }

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2 style={headerStyle}>👤 My Profile</h2>
        {/* Progress bar */}
        <div style={{ width: '100%', marginBottom: 14 }}>
          <div style={progressBgStyle}>
            <div style={{
              ...progressStyle,
              width: `${progress}%`,
              background: progress === 100 ? 'linear-gradient(90deg,#22c55e,#4ade80)' : 'linear-gradient(90deg,#60a5fa,#6366f1)'
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
        <div style={{ height: 12 }}></div>

        {/* Avatar + upload/delete */}
        <div style={{ textAlign: 'center', marginBottom: '1.4rem', position: 'relative' }}>
          <div style={{ display: 'inline-block', position: 'relative' }}>
            {avatarPreview
              ? <img src={avatarPreview} alt="Avatar" style={avatarStyle} />
              : <div style={{ ...avatarStyle, backgroundColor: '#313e54', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 42, color: '#aaa' }}>
                <FiUpload />
              </div>}
            {editMode && avatarPreview &&
              <button onClick={handleRemoveAvatar} title="Remove" style={avatarDeleteBtn}>
                <FiTrash2 />
              </button>}
          </div>
          {editMode && (
            <div style={{ marginTop: '0.6rem' }}>
              <label htmlFor="avatar-upload" style={avatarUploadLabel}>
                <FiUpload style={{ marginRight: 4, marginBottom: -2 }} />
                {loadingAvatar ? "Uploading..." : "Upload Photo"}
              </label>
              <input id="avatar-upload" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
              <div style={{ color: '#64748b', fontSize: '.98rem', marginTop: 4 }}>JPG/PNG, max 1MB</div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div style={dividerStyle} />

        {/* Fields */}
        <Field label="Gender" type="select" value={form.gender} onChange={v => handleChange('gender', v)} options={GENDERS} disabled={!editMode} />
        <Field label="Career" type="select" value={form.career} onChange={v => handleChange('career', v)} options={CAREERS} disabled={!editMode} />
        <Field label="Experience" type="select" value={form.experience} onChange={v => handleChange('experience', v)} options={EXPERIENCE} disabled={!editMode} />
        <Field label="Education" type="select" value={form.education} onChange={v => handleChange('education', v)} options={EDUCATION} disabled={!editMode} />
        <Field label="Location" type="select" value={form.location} onChange={v => handleChange('location', v)} options={LOCATIONS} disabled={!editMode} />
        <Field label="Industry (optional)" type="text" value={form.industry} onChange={v => handleChange('industry', v)} disabled={!editMode} />

        {/* Feedback */}
        <div style={{ minHeight: 32, margin: '8px 0 5px 0' }}>
          {error &&
            <div style={errorAlertStyle}>
              <FiAlertCircle style={{ marginRight: 7, fontSize: 19 }} />
              {error}
            </div>}
          {success &&
            <div style={successAlertStyle}>
              <FiCheckCircle style={{ marginRight: 7, fontSize: 19 }} />
              {success}
            </div>}
        </div>

        {/* Actions */}
        <div style={{ textAlign: 'center', marginTop: '1.7rem' }}>
          {editMode
            ? <button onClick={handleSave} style={saveBtnStyle} disabled={progress < 100}>💾 Save</button>
            : <button onClick={() => setEditMode(true)} style={editBtnStyle}><FiEdit2 style={{ marginRight: 6, marginBottom: -2 }} />Edit Profile</button>
          }
        </div>
      </div>
    </div>
  );
}

function Field({ label, type, value, onChange, options, disabled }) {
  return (
    <div style={fieldStyle}>
      <label style={labelStyle}>{label}</label>
      {type === 'select' ? (
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          disabled={disabled}
          style={{ ...inputStyle, backgroundColor: disabled ? '#2d384b' : '#f1f5f9', color: disabled ? '#a2adc5' : '#18181b', cursor: disabled ? 'not-allowed' : 'pointer' }}
        >
          <option value="">-- Select --</option>
          {options.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      ) : (
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          disabled={disabled}
          style={{ ...inputStyle, backgroundColor: disabled ? '#2d384b' : '#f1f5f9', color: disabled ? '#a2adc5' : '#18181b', cursor: disabled ? 'not-allowed' : 'auto' }}
          placeholder={label}
        />
      )}
    </div>
  );
}

// --- Styles ---

const containerStyle = {
  minHeight: '100vh',
  background: `linear-gradient(135deg, #1a2236 0%, #1f2a38 100%), url('/images/haikei-bg.svg') repeat`,
  backgroundSize: 'cover',
  backgroundBlendMode: 'overlay',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '2vw'
};

const cardStyle = {
  width: '100%',
  maxWidth: 450,
  background: 'rgba(30, 41, 59, 0.97)',
  borderRadius: 18,
  boxShadow: '0 8px 32px 0 rgba(31,41,55,0.18)',
  padding: '2.1rem 2.5rem 2.5rem 2.5rem',
  margin: '3rem auto 2rem auto'
};

const headerStyle = {
  fontSize: '2rem',
  fontWeight: 700,
  marginBottom: '0.5rem',
  color: '#a78bfa',
  textAlign: 'center'
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

const dividerStyle = {
  borderTop: '1.5px solid #27304c',
  width: '100%',
  margin: '18px 0 22px 0'
};

const avatarStyle = {
  width: 120,
  height: 120,
  borderRadius: '50%',
  objectFit: 'cover',
  border: '3.5px solid #6366f1',
  boxShadow: '0 4px 22px #232e44aa',
  backgroundColor: '#232e44',
  transition: 'box-shadow 0.2s'
};

const avatarDeleteBtn = {
  position: 'absolute',
  bottom: 8,
  right: -14,
  background: '#ef4444',
  color: '#fff',
  border: 'none',
  borderRadius: '50%',
  width: 32,
  height: 32,
  cursor: 'pointer',
  boxShadow: '0 2px 6px #232e44bb',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 18
};

const avatarUploadLabel = {
  display: 'inline-block',
  cursor: 'pointer',
  color: '#60a5fa',
  background: 'rgba(37, 99, 235, 0.09)',
  padding: '8px 18px',
  borderRadius: 7,
  fontWeight: 500,
  fontSize: '1.01rem',
  marginTop: 4,
  border: '1.2px solid #2563eb33',
  transition: 'background .14s'
};

const fieldStyle = {
  marginBottom: '1.25rem'
};

const labelStyle = {
  display: 'block',
  marginBottom: '0.38rem',
  fontWeight: 500,
  color: '#e0e7ef'
};

const inputStyle = {
  width: '100%',
  padding: '0.7rem',
  borderRadius: '7px',
  border: '1.2px solid #27304c',
  fontSize: '1.05rem',
  backgroundColor: '#2d384b',
  color: '#e0e7ef',
  outline: 'none',
  marginTop: 2
};

const saveBtnStyle = {
  background: 'linear-gradient(90deg,#22d3ee 60%,#6366f1 100%)',
  color: '#fff',
  padding: '0.85rem 2.4rem',
  border: 'none',
  borderRadius: '7px',
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: '1.07rem',
  boxShadow: '0 4px 12px #232e4455',
  margin: '0 5px',
  transition: 'background .17s,transform .18s',
  letterSpacing: '.01em'
};

const editBtnStyle = {
  background: 'linear-gradient(90deg,#6366f1 60%,#22d3ee 100%)',
  color: '#fff',
  padding: '0.85rem 2.4rem',
  border: 'none',
  borderRadius: '7px',
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: '1.07rem',
  boxShadow: '0 4px 12px #232e4455',
  margin: '0 5px',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  transition: 'background .17s,transform .18s',
  letterSpacing: '.01em'
};

const errorAlertStyle = {
  color: '#ef4444',
  background: 'rgba(239,68,68,0.12)',
  border: '1.4px solid #ef444466',
  borderRadius: 7,
  padding: '0.68rem 1.2rem',
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
  padding: '0.68rem 1.2rem',
  display: 'flex',
  alignItems: 'center',
  fontWeight: 500,
  fontSize: '1.07rem',
  margin: '0.5rem 0 0.2rem 0'
};
