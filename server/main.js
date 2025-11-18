// server/main.js
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';

// --- Server-only files / methods ---
import './chatbot.js';
import '/imports/api/users.js';
import '/imports/api/mockInterview.js';
import '/imports/api/adminMethods.js';

// Give every new user a default role (if none was set during signup)
Accounts.onCreateUser((options, user) => {
  user.profile = options?.profile || {};
  if (!user.profile.role) {
    user.profile.role = 'jobSeeker'; // default role
  }
  return user;
});

// Disallow client-side writes to Meteor.users (extra safety)
Meteor.users.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});

// Publish minimal current-user fields only
Meteor.publish('userData', function () {
  if (!this.userId) {
    return this.ready();
  }
  return Meteor.users.find(
    { _id: this.userId },
    { fields: { username: 1, profile: 1, createdAt: 1 } }
  );
});

Meteor.startup(() => {
  // code to run on server at startup (if needed)
});
