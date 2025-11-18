// imports/api/adminMethods.js
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { check, Match } from 'meteor/check';

async function assertAdmin(ctx) {
  if (!ctx.userId) throw new Meteor.Error('not-authorized', 'Login required');

  const me = await Meteor.users.findOneAsync(
    { _id: ctx.userId },
    { fields: { 'profile.role': 1 } }
  );
  if (me?.profile?.role !== 'admin') {
    throw new Meteor.Error('not-authorized', 'Admins only');
  }
}

Meteor.methods({
  // ---- Users table data (small payload) ----
  async getAllUsers() {
    try {
      await assertAdmin(this);

      const rows = await Meteor.users
        .rawCollection()
        .find({}, { projection: { username: 1, createdAt: 1, 'profile.role': 1 } })
        .toArray();

      return rows.map(u => ({
        _id: u._id,
        username: u.username || '(no username)',
        createdAt: u.createdAt || null,
        profile: { role: u.profile?.role || 'jobSeeker' },
      }));
    } catch (e) {
      console.error('[admin.getAllUsers] failed:', e);
      throw new Meteor.Error('server-error', 'Failed to load users');
    }
  },

  // ---- Simple stats (no disable count anymore) ----
  async getUserStats() {
    await assertAdmin(this);
    const col = Meteor.users.rawCollection();
    const total = await col.countDocuments({});
    const admins = await col.countDocuments({ 'profile.role': 'admin' });
    const recruiters = await col.countDocuments({ 'profile.role': 'recruiter' });
    const jobSeekers = await col.countDocuments({ 'profile.role': 'jobSeeker' });
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const new7d = await col.countDocuments({ createdAt: { $gte: since } });

    return { total, admins, recruiters, jobSeekers, new7d };
  },

  // ---- Change role ----
  async updateUserRole(userId, newRole) {
    check(userId, String);
    check(newRole, Match.OneOf('admin', 'recruiter', 'jobSeeker'));

    try {
      await assertAdmin(this);
      await Meteor.users.updateAsync(
        { _id: userId },
        { $set: { 'profile.role': newRole } }
      );
      return true;
    } catch (e) {
      console.error('[admin.updateUserRole] failed:', e);
      throw new Meteor.Error('server-error', 'Failed to update role');
    }
  },

  // ---- Delete user (admins are protected) ----
  async deleteUser(userId) {
    check(userId, String);
    try {
      await assertAdmin(this);

      const target = await Meteor.users.findOneAsync(
        { _id: userId },
        { fields: { 'profile.role': 1 } }
      );
      if (target?.profile?.role === 'admin') {
        throw new Meteor.Error('not-allowed', 'Admins cannot be deleted');
      }

      await Meteor.users.removeAsync({ _id: userId });
      return true;
    } catch (e) {
      console.error('[admin.deleteUser] failed:', e);
      throw new Meteor.Error(e.error || 'server-error', e.reason || 'Failed to delete user');
    }
  },

  // ---- Set password directly (no email) ----
  async adminSetPassword(userId, newPassword) {
    check(userId, String);
    check(newPassword, String);

    // quick server-side validation
    if (newPassword.length < 8) {
      throw new Meteor.Error('validation', 'Password must be at least 8 characters');
    }

    await assertAdmin(this);

    try {
      if (typeof Accounts.setPasswordAsync === 'function') {
        await Accounts.setPasswordAsync(userId, newPassword);
      } else {
        Accounts.setPassword(userId, newPassword);
      }
      return true;
    } catch (e) {
      console.error('[admin.adminSetPassword] failed:', e);
      throw new Meteor.Error('server-error', 'Failed to set password');
    }
  },
});
