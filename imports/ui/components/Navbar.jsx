import React from 'react';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaBriefcase } from 'react-icons/fa'; // You can change to any icon you like!
import { motion } from 'framer-motion';

export default function Navbar() {
  const user = useTracker(() => Meteor.user(), []);
  const navigate = useNavigate();
  const handleLogout = () => Meteor.logout(() => navigate('/login'));

  // List of nav links for easy mapping
  const navLinks = [
    { to: '/', label: 'Home' },
    ...(user
      ? [
          { to: '/profile', label: 'My Profile' },
          { to: '/salary', label: 'Salary Estimator' },
          { to: '/interview', label: 'Mock Interview' },
          { to: '/resume-builder', label: 'Resume Builder' },
          { to: '/resume-parser', label: 'Resume Parser' },
          { to: '/resources', label: 'Resources' },
        ]
      : []),
  ];

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        {/* Animated Logo & Title */}
        <div
          className="logo"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.8rem',
            marginLeft: '-15px',
            cursor: 'pointer',
            userSelect: 'none',
          }}
          onClick={() => navigate('/')}
        >
          {/* Framer Motion animated icon */}
          <motion.span
            initial={{ rotate: 0, scale: 1 }}
            whileHover={{ rotate: 15, scale: 1.13 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            style={{ display: 'inline-block' }}
          >
            <FaBriefcase size={28} color="#2563eb" />
          </motion.span>
          <span>Career Navigator</span>
        </div>
        {/* Nav links with separator */}
        <div className="nav-links">
          {navLinks.map((link, idx) => (
            <React.Fragment key={link.to}>
              <NavLink to={link.to} className={({ isActive }) => (isActive ? 'active' : '')}>
                {link.label}
              </NavLink>
              {idx < navLinks.length - 1 && (
                <span className="nav-separator">|</span>
              )}
            </React.Fragment>
          ))}
        </div>
        <div className="auth">
          {!user ? (
            <NavLink to="/login" className="primary-btn">
              Login
            </NavLink>
          ) : (
            <button className="primary-btn" onClick={handleLogout}>
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
