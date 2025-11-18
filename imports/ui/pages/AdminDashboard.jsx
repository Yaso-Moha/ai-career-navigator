// imports/ui/pages/AdminDashboard.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { Meteor } from 'meteor/meteor';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [q, setQ] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const fetchUsers = () => {
    setLoading(true); setError('');
    Meteor.call('getAllUsers', (err, res) => {
      if (err) { setError(err.reason || err.message || 'Internal error'); setUsers([]); }
      else setUsers(res || []);
      setLoading(false);
    });
  };

  const fetchStats = () => {
    Meteor.call('getUserStats', (err, res) => {
      if (!err) setStats(res);
    });
  };

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, []);

  const changeRole = (id, role) => {
    Meteor.call('updateUserRole', id, role, (err) => {
      if (err) return alert(err.reason || 'Update failed');
      setUsers(prev => prev.map(u => (u._id === id ? { ...u, profile: { ...u.profile, role } } : u)));
      fetchStats();
    });
  };

  const setPassword = (id) => {
    const pwd = prompt('Enter a new password (min 8 chars):');
    if (pwd == null) return; // cancelled
    if (pwd.length < 8) return alert('Password must be at least 8 characters.');

    Meteor.call('adminSetPassword', id, pwd, (err) => {
      if (err) alert(err.reason || 'Failed to set password');
      else alert('Password updated successfully.');
    });
  };

  const deleteUser = (u) => {
    if (u.profile?.role === 'admin') {
      return alert('Admins cannot be deleted.');
    }
    if (!confirm(`Delete user "${u.username}"?`)) return;

    Meteor.call('deleteUser', u._id, (err) => {
      if (err) return alert(err.reason || 'Delete failed');
      setUsers(prev => prev.filter(x => x._id !== u._id));
      fetchStats();
    });
  };

  // Client-side filtering
  const filtered = useMemo(() => {
    const qlc = q.trim().toLowerCase();
    return users.filter(u => {
      if (qlc && !(u.username || '').toLowerCase().includes(qlc)) return false;
      if (roleFilter !== 'all' && (u.profile?.role || 'jobSeeker') !== roleFilter) return false;
      return true;
    });
  }, [users, q, roleFilter]);

  const exportCSV = () => {
    const header = ['_id','username','role','createdAt'];
    const rows = filtered.map(u => [
      u._id,
      u.username,
      u.profile?.role || '',
      u.createdAt ? new Date(u.createdAt).toISOString() : ''
    ]);
    const csv = [header, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'users.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>⚙️ Admin Dashboard</h2>

      {/* Stats */}
      {stats && (
        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
          {[
            ['Total', stats.total],
            ['Admins', stats.admins],
            ['Recruiters', stats.recruiters],
            ['Job Seekers', stats.jobSeekers],
            ['New (7d)', stats.new7d],
          ].map(([label, value]) => (
            <div key={label} style={{ padding: '0.5rem 0.8rem', border: '1px solid #3a4', borderRadius: 8 }}>
              <div style={{ fontSize: 12, opacity: 0.7 }}>{label}</div>
              <div style={{ fontSize: 18, fontWeight: 600 }}>{value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tools */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 16 }}>
        <input
          placeholder="Search username…"
          value={q}
          onChange={e => setQ(e.target.value)}
          style={{ padding: 8, minWidth: 220 }}
        />
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} style={{ padding: 8 }}>
          <option value="all">All roles</option>
          <option value="jobSeeker">Job Seeker</option>
          <option value="recruiter">Recruiter</option>
          <option value="admin">Admin</option>
        </select>
        <button onClick={exportCSV}>Export CSV</button>
        <button onClick={() => { setQ(''); setRoleFilter('all'); }}>Clear</button>
        <button onClick={() => { fetchUsers(); fetchStats(); }}>Refresh</button>
      </div>

      {loading && <p>Loading users…</p>}
      {error && (
        <p style={{ color: 'red' }}>
          {error} &nbsp;
          <button onClick={() => { fetchUsers(); fetchStats(); }} style={{ marginLeft: 8 }}>Retry</button>
        </p>
      )}

      {!loading && !error && (
        <table border="1" cellPadding="10" style={{ marginTop: '1rem', width: '100%' }}>
          <thead>
            <tr>
              <th>Username</th>
              <th>Role</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u._id}>
                <td>{u.username}</td>
                <td>
                  <select
                    value={u.profile?.role || 'jobSeeker'}
                    onChange={(e) => changeRole(u._id, e.target.value)}
                  >
                    <option value="jobSeeker">Job Seeker</option>
                    <option value="recruiter">Recruiter</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '-'}</td>
                <td style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setPassword(u._id)}>Set Password</button>
                  <button
                    disabled={u.profile?.role === 'admin'}
                    onClick={() => deleteUser(u)}
                    style={u.profile?.role === 'admin' ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '1rem' }}>
                  No users match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
