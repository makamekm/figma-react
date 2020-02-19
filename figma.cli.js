#!/usr/bin/env node

const figmaReact = require('./figma');

if (process.env.FIGMA_FILE_KEY_DEFAULT) {
  figmaReact.runFigmaReact().catch(err => {
    console.error(err);
    console.error(err.stack);
    process.exit(1);
  });
}

module.exports = {
  ...figmaReact,
};
