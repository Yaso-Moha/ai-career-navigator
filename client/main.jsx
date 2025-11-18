// client/main.jsx
import { Meteor } from 'meteor/meteor';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';

import AppWrapper from '/imports/ui/AppWrapper';

Meteor.startup(() => {
  const container = document.getElementById('react-target');
  const root = createRoot(container);
  root.render(
    <HashRouter>
      <AppWrapper />
    </HashRouter>
  );
});
