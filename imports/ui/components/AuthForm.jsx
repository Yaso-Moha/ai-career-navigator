// imports/ui/components/AuthForm.jsx
import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { useNavigate } from 'react-router-dom';

export default function AuthForm() {
  const [isSignup, setIsSignup] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('jobSeeker'); // ✅ canonical default
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const toggleForm = () => {
    setIsSignup(!isSignup);
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const uname = username.trim();
    const pwd = password.trim();

    if (uname.length < 6) {
      setError('Username must be at least 6 characters');
      return;
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{6,}$/;
    if (!passwordRegex.test(pwd)) {
      setError('Password must be at least 6 characters and include a number and a symbol');
      return;
    }

    if (isSignup) {
      Meteor.call('checkUsernameExists', uname, (err, exists) => {
        if (err) return setError('Server error. Please try again.');
        if (exists) return setError('This username is already taken.');

        // ✅ Save only allowed canonical roles
        const roleToSave = role === 'recruiter' ? 'recruiter' : 'jobSeeker';

        Accounts.createUser({ username: uname, password: pwd, profile: { role: roleToSave } }, (err2) => {
          if (err2) setError(err2.reason || 'Error creating account');
          else navigate('/profile-setup');
        });
      });
    } else {
      Meteor.loginWithPassword(uname, pwd, (err3) => {
        if (err3) setError('Invalid username or password');
        // AppWrapper will redirect away from /login once logged in
      });
    }
  };

  return (
    <div style={containerStyle}>
      <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>
        {isSignup ? 'Sign Up' : 'Login'}
      </h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          style={inputStyle}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={inputStyle}
        />

        {/* Show role selection only during sign-up */}
        {isSignup && (
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            style={inputStyle}
          >
            <option value="jobSeeker">Job Seeker</option> {/* ✅ canonical */}
            <option value="recruiter">Recruiter</option>
          </select>
        )}

        <button type="submit" style={buttonStyle}>
          {isSignup ? 'Create Account' : 'Login'}
        </button>
      </form>
      {error && <p style={{ color: 'salmon', marginTop: '1rem' }}>{error}</p>}
      <p style={{ marginTop: '1rem', textAlign: 'center' }}>
        {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
        <button
          onClick={toggleForm}
          style={{
            border: 'none',
            background: 'none',
            color: '#3b82f6',
            cursor: 'pointer',
            fontSize: '1rem',
          }}
        >
          {isSignup ? 'Login here' : 'Sign up'}
        </button>
      </p>
    </div>
  );
}

const containerStyle = {
  maxWidth: '400px',
  margin: '5rem auto',
  padding: '2rem',
  backgroundColor: '#1f2937',
  borderRadius: '8px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
  color: '#f9fafb',
};

const inputStyle = {
  width: '100%',
  padding: '0.75rem',
  marginBottom: '1rem',
  borderRadius: '6px',
  border: '1px solid #374151',
  backgroundColor: '#374151',
  color: '#f9fafb',
  fontSize: '1rem',
};

const buttonStyle = {
  width: '100%',
  padding: '0.75rem',
  backgroundColor: '#3b82f6',
  color: '#ffffff',
  border: 'none',
  borderRadius: '6px',
  fontSize: '1rem',
  cursor: 'pointer',
};
