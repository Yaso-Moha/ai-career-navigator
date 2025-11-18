// imports/api/users.js
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

Meteor.methods({
  // ——— Check if a username already exists ———————————————————————————
  async checkUsernameExists(username) {
    // Validate
    check(username, String);
    const clean = username.trim();

    console.log(`[checkUsernameExists] checking: "${clean}"`);
    // Use the async version of findOne on the server
    const user = await Meteor.users.findOneAsync({ username: clean });
    console.log('[checkUsernameExists] result:', user ? user._id : null);

    return !!user;
  },

  // ——— Update the job seeker’s profile —————————————————————————————
  async updateJobSeekerProfile(data) {
    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in');
    }

    const fields = {
      'profile.gender':       data.gender       || '',
      'profile.career':       data.career       || '',
      'profile.experience':   data.experience   || '',
      'profile.education':    data.education    || '',
      'profile.location':     data.location     || '',
      'profile.industry':     data.industry     || '',
      'profile.expectedSalary': data.expectedSalary || '',
      'profile.github':       data.github       || '',
      'profile.linkedin':     data.linkedin     || ''
      // …add more profile fields here if you like…
    };

    // Modern async update
    const result = await Meteor.users.updateAsync(
      { _id: this.userId },
      { $set: fields }
    );

    if (result === 0) {
      throw new Meteor.Error('update-failed', 'Could not update user profile');
    }

    return true;
  },
});
