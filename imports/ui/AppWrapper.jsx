// imports/ui/AppWrapper.jsx
import React from 'react';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { Routes, Route, Navigate } from 'react-router-dom';

import Navbar from './components/Navbar';
import ChatLauncher from './components/ChatLauncher';

import Resources from './pages/Resources';
import Home from './pages/Home';
import AuthForm from './components/AuthForm';
import ProfileSetup from './pages/ProfileSetup';
import ProfilePage from './pages/ProfilePage';
import SalaryEstimator from './pages/SalaryEstimator';
import MockInterview from './pages/MockInterview';
import ResumeBuilder from './pages/ResumeBuilder';
import ResumeParser from './pages/ResumeParser.jsx';
import AdminDashboard from './pages/AdminDashboard';

// ---------- Guard ----------
function ProtectedRoute({ children, role }) {
  const { user, loggingIn, ready } = useTracker(() => {
    const sub = Meteor.subscribe('userData'); // subscribe to current-user fields
    return {
      user: Meteor.user(),
      loggingIn: Meteor.loggingIn(),
      ready: sub.ready(),
    };
  }, []);

  // Normalize/defend against odd strings
  const userRole = (user?.profile?.role ?? '').toString().trim().toLowerCase();
  const needRole = (role ?? '').toString().trim().toLowerCase();

  // Debug log: open DevTools Console (enable "Verbose" level) to see this
  console.log('[ProtectedRoute]', {
    loggingIn,
    ready,
    hasUser: !!user,
    userRole,
    needRole,
  });

  if (loggingIn || !ready) return <p style={{ padding: '2rem' }}>Loading…</p>;
  if (!user) return <Navigate to="/login" replace />;

  if (needRole && userRole !== needRole) {
    console.warn('[ProtectedRoute] redirecting: role mismatch', { userRole, needRole });
    return <Navigate to="/" replace />;
  }

  return children;
}

// ---------- App Shell ----------
export default function AppWrapper() {
  // Keep subscription at top level too (helps initial pages not wrapped by ProtectedRoute)
  const { loggingIn, ready, userId } = useTracker(() => {
    const sub = Meteor.subscribe('userData');
    return {
      loggingIn: Meteor.loggingIn(),
      ready: sub.ready(),
      userId: Meteor.userId(),
    };
  }, []);

  if (loggingIn || !ready) return <p style={{ padding: '2rem' }}>Loading…</p>;

  return (
    <>
      <Navbar />
      {/* Floating chat widget */}
      <ChatLauncher />

      <div style={{ marginTop: '4rem' }}>
        <Routes>
          <Route path="/" element={<Home />} />

          {/* Auth */}
          <Route
            path="/login"
            element={!userId ? <AuthForm /> : <Navigate to="/" replace />}
          />

          {/* Protected pages */}
          <Route path="/profile-setup" element={<ProtectedRoute><ProfileSetup /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/resume-builder" element={<ProtectedRoute><ResumeBuilder /></ProtectedRoute>} />
          <Route path="/salary" element={<ProtectedRoute><SalaryEstimator /></ProtectedRoute>} />
          <Route path="/interview" element={<ProtectedRoute><MockInterview /></ProtectedRoute>} />
          <Route path="/resume-parser" element={<ProtectedRoute><ResumeParser /></ProtectedRoute>} />
          <Route path="/resources" element={<ProtectedRoute><Resources /></ProtectedRoute>} />

          {/* Admin-only */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </>
  );
}
