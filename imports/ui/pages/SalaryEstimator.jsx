// imports/ui/pages/SalaryEstimator.jsx
import React, { useMemo } from 'react';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { salaryData } from '/imports/data/salary-data-rich';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList, LineChart, Line
} from 'recharts';
import CountUp from 'react-countup';
import { FiBriefcase, FiMapPin, FiAward, FiTrendingUp, FiBookOpen, FiExternalLink, FiArrowUpRight } from 'react-icons/fi';

const pageBgStyle = {
  minHeight: '100vh',
  background: `
    linear-gradient(135deg, #1a2236 0%, #1f2a38 100%),
    url('/images/haikei-bg.svg') repeat
  `,
  backgroundSize: 'cover',
  backgroundBlendMode: 'overlay',
};

function Chip({ icon, text, color = '#2563eb', bg = '#e0e7ff' }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      background: bg, color, fontWeight: 500, borderRadius: 999,
      fontSize: '0.93rem', padding: '0.28em 0.85em', marginRight: 8, marginBottom: 8
    }}>
      {icon} {text}
    </span>
  );
}

export default function SalaryEstimator() {
  // Always call hooks at the top (no conditional/early returns before hooks)
  const { user, ready, loggingIn } = useTracker(() => {
    const sub = Meteor.subscribe('userData');
    return {
      user: Meteor.user(),
      ready: sub.ready(),
      loggingIn: Meteor.loggingIn(),
    };
  }, []);

  const profile = user?.profile || null;
  const role = (profile?.role || '').toString().trim().toLowerCase();

  // Always call useMemo—guard inside
  const match = useMemo(() => {
    if (!profile) return null;
    const { career, location, experience, education } = profile;
    if (!career || !location || !experience || !education) return null;
    return (
      salaryData.find(
        s =>
          s.career === career &&
          s.location === location &&
          s.experience === experience &&
          s.education === education
      ) || null
    );
  }, [profile]);

  // ---- Render gates (AFTER hooks) ----
  if (loggingIn || !ready) {
    return <div className="card" style={{ marginTop: '6rem', textAlign: 'center' }}>Loading profile...</div>;
  }
  if (!user) {
    return <div className="card" style={{ marginTop: '6rem', textAlign: 'center' }}>Please log in.</div>;
  }
  if (role !== 'jobseeker') {
    return (
      <div className="card" style={{ marginTop: '6rem', textAlign: 'center' }}>
        <h2>Salary Estimator</h2>
        <p>This tool is available for Job Seekers.</p>
      </div>
    );
  }
  if (!match) {
    return (
      <div className="card" style={{ marginTop: '6rem', textAlign: 'center' }}>
        <h2>No Salary Data Found</h2>
        <p>We couldn't find salary data that matches your profile yet.</p>
        <p>Please edit your profile or try broader options.</p>
      </div>
    );
  }

  // ---- Derived data (safe now that match exists) ----
  const trendData = [
    { year: 2020, value: Math.round(match.avg * 0.85) },
    { year: 2021, value: Math.round(match.avg * 0.9) },
    { year: 2022, value: Math.round(match.avg * 0.95) },
    { year: 2023, value: Math.round(match.avg) },
    { year: 2024, value: Math.round(match.avg * 1.03) },
  ];

  const similarRoles = [
    { role: 'Product Manager', salary: 3200 },
    { role: 'Web Developer', salary: 2000 },
    { role: 'Data Scientist', salary: 2900 },
  ];

  const nationalAvg = match.avg * 0.92;
  const chartData = [
    { label: 'Minimum', value: match.min },
    { label: 'Average', value: match.avg },
    { label: 'Maximum', value: match.max },
  ];
  const maxY = Math.max(match.max, match.avg, match.min) + 300;

  const percentDiff = ((match.avg - nationalAvg) / nationalAvg) * 100;
  let percentile = 50;
  if (percentDiff >= 30) percentile = 90;
  else if (percentDiff >= 20) percentile = 80;
  else if (percentDiff >= 10) percentile = 70;
  else if (percentDiff >= 0) percentile = 60;
  else if (percentDiff > -10) percentile = 40;
  else if (percentDiff > -20) percentile = 30;
  else percentile = 20;

  const growthBase = trendData[0].value;
  const growthNow = trendData[trendData.length - 1].value;
  const growthPercent = Math.round(((growthNow - growthBase) / growthBase) * 100);

  function getCareerTip(m) {
    if (m.career === 'UI/UX Designer') {
      return 'Upskill in prototyping tools (Figma/Sketch) or a front-end framework (React) to boost your value.';
    }
    if (m.career === 'Software Engineer') {
      return 'Cloud (AWS/Azure) and system design skills increase demand and salary.';
    }
    return 'Keep skills current and build a strong professional network.';
  }

  return (
    <div style={pageBgStyle}>
      <div
        className="card"
        style={{
          background: 'rgba(31,41,55,0.97)',
          maxWidth: 780,
          margin: '5rem auto 3rem',
          borderRadius: 18,
          boxShadow: '0 8px 32px 0 rgba(31,41,55,.30)',
        }}
      >
        {/* Summary */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 22,
            padding: '2.1rem 2.2rem 1.2rem 2.2rem',
            borderBottom: '1px solid #222a3a',
            marginBottom: '2rem',
          }}
        >
          <div
            style={{
              background: 'linear-gradient(135deg,#3b82f6 60%,#a5b4fc 100%)',
              width: 62,
              height: 62,
              borderRadius: 15,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FiBriefcase color="#fff" size={32} />
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ color: '#fff', fontWeight: 600, fontSize: '2.1rem', margin: 0 }}>
              <CountUp end={match.avg} duration={2.2} separator="," prefix="$" suffix=" /mo" />{' '}
              <span style={{ fontSize: '1.15rem', fontWeight: 500, marginLeft: 7, color: '#60a5fa' }}>
                Estimated
              </span>
            </h2>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.5rem 0.7rem',
                marginTop: 14,
                marginBottom: 2,
                alignItems: 'center',
              }}
            >
              <Chip icon={<FiBriefcase />} text={match.career} />
              <Chip icon={<FiMapPin />} text={match.location} color="#ea580c" bg="#fef3c7" />
              <Chip icon={<FiAward />} text={match.experience} color="#059669" bg="#d1fae5" />
              <Chip icon={<FiBookOpen />} text={match.education} color="#a21caf" bg="#fae8ff" />
            </div>
          </div>
          <div style={{ minWidth: 94, textAlign: 'center' }}>
            <div style={{ color: growthPercent >= 0 ? '#22c55e' : '#ef4444', fontWeight: 600, fontSize: '1.12rem' }}>
              <FiTrendingUp /> {growthPercent >= 0 ? `+${growthPercent}%` : `${growthPercent}%`}
            </div>
            <div style={{ color: growthPercent >= 0 ? '#a3e635' : '#f87171', fontSize: '.92rem', fontWeight: 500 }}>
              5yr growth
            </div>
          </div>
        </div>

        {/* Bar chart */}
        <div style={{ width: '100%', height: 290, marginBottom: 30 }}>
          <ResponsiveContainer>
            <BarChart data={chartData}>
              <XAxis dataKey="label" stroke="#cbd5e1" fontSize={14} />
              <YAxis domain={[0, maxY]} stroke="#cbd5e1" fontSize={14} />
              <Tooltip
                formatter={val => [`$${val.toLocaleString()} /mo`, 'Salary']}
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', color: '#fff', fontSize: '14px' }}
                wrapperStyle={{ backgroundColor: '#1f2937' }}
                cursor={{ fill: '#1f2937' }}
              />
              <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]}>
                <LabelList dataKey="value" position="top" formatter={val => `$${val.toLocaleString()} /mo`} fill="#fff" fontSize={15} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Trend chart */}
        <div style={{ width: '100%', height: 170, margin: '0 auto 28px auto', background: '#172031', borderRadius: 10, padding: 10 }}>
          <h4 style={{ color: '#94a3b8', marginLeft: 8, marginBottom: 0 }}>📈 Salary Trend (last 5 years)</h4>
          <ResponsiveContainer>
            <LineChart data={trendData}>
              <XAxis dataKey="year" stroke="#cbd5e1" fontSize={13} />
              <YAxis stroke="#cbd5e1" fontSize={13} />
              <Tooltip
                formatter={val => [`$${val.toLocaleString()} /mo`, 'Salary']}
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', color: '#fff', fontSize: '14px' }}
              />
              <Line type="monotone" dataKey="value" stroke="#22d3ee" strokeWidth={3} dot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Similar roles */}
        <div style={{
          background: 'rgba(24,30,42,0.83)', borderRadius: 10, padding: '1.1rem 1.3rem',
          margin: '1.2rem 0 1.6rem', fontSize: '1.04rem', color: '#f3f4f6'
        }}>
          <b>💡 Other popular roles in {match.location}:</b><br />
          <div style={{ display: 'flex', gap: 16, marginTop: 7, flexWrap: 'wrap' }}>
            {[
              { role: 'Product Manager', salary: 3200 },
              { role: 'Web Developer', salary: 2000 },
              { role: 'Data Scientist', salary: 2900 },
            ].map((r, i) => (
              <div key={i} style={{
                background: '#232e44',
                borderRadius: 6,
                padding: '0.65rem 1.1rem',
                fontWeight: 600,
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: 9,
                color: '#7dd3fc'
              }}>
                <FiArrowUpRight size={18} />
                <span>{r.role}</span>
                <span style={{ color: '#facc15', marginLeft: 7 }}>${r.salary}/mo</span>
              </div>
            ))}
          </div>
        </div>

        {/* Explainer */}
        <div style={{
          background: 'rgba(51,65,85,0.55)', borderRadius: 9, padding: '1.1rem 1.7rem',
          margin: '1.4rem 0 1.8rem', fontSize: '.97rem', color: '#f3f4f6'
        }}>
          <b>How is your salary estimate calculated?</b><br />
          Your range is based on thousands of industry records, adjusted for role, education, experience, and location using smart multipliers.
        </div>

        {/* Personalized tip */}
        <div style={{
          background: 'rgba(34,197,94,0.18)', borderRadius: 9, padding: '1.1rem 1.7rem',
          margin: '1.2rem 0 1.2rem', fontSize: '1.03rem', color: '#10b981',
          borderLeft: '5px solid #10b981'
        }}>
          <b>Personalized Advice:</b><br />
          {getCareerTip(match)}
        </div>

        {/* Links */}
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center', alignItems: 'stretch' }}>
          <a href="https://www.glassdoor.com/Salaries/index.htm" target="_blank" rel="noreferrer"
             style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'linear-gradient(90deg,#60a5fa 80%,#1e293b 100%)',
                      color: '#fff', borderRadius: 10, padding: '0.75em 1.7em', fontWeight: 600, textDecoration: 'none',
                      fontSize: '1.08rem', marginBottom: 8 }}>
            <FiExternalLink size={20} /> See live job salaries
          </a>
          <a href="https://www.indeed.com/career-advice/pay-salary/how-to-negotiate-salary" target="_blank" rel="noreferrer"
             style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'linear-gradient(90deg,#10b981 80%,#1e293b 100%)',
                      color: '#fff', borderRadius: 10, padding: '0.75em 1.7em', fontWeight: 600, textDecoration: 'none',
                      fontSize: '1.08rem', marginBottom: 8 }}>
            <FiExternalLink size={20} /> Tips: Negotiate Your Salary
          </a>
        </div>

        <div style={{ marginTop: '2.1rem', fontSize: '0.97rem', color: '#94a3b8', textAlign: 'center' }}>
          📊 All salary figures are shown in USD/month for demonstration purposes.
        </div>
      </div>
    </div>
  );
}
