#!/usr/bin/env node

const figmaReact = require('.');

figmaReact.runFigmaReact().catch(err => {
  console.error(err);
  console.error(err.stack);
  process.exit(1);
});
