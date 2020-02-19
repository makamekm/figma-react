require('dotenv').config();

const { preprocessCanvasComponents, createComponents, generateComponent } = require('./figma.lib');
const { loadCanvas, loadNodes, loadImages, loadURLImages, getHeaders } = require('./figma.api');
const { contentPlugins } = require('./figma.content.plugins');
const { stylePlugins } = require('./figma.style.plugins');

// Options:
// - fileKey // * required
// - devToken // * required
// - dir // default './src/design-system'
// - stylePlugins // default from './figma.style.plugins'
// - contentPlugins // default from './figma.content.plugins'
// - classPrefix // default 'figma-'
// - delIndex // default '??'
// - paramsSplitIndex // default '&'
// - paramSplitIndex // default '='
// - objectIndex // default '.'
// - styleDescriptionDelimiter // default '!style!'
// - imports // default ['import { observer } from 'mobx-react';']
// - decorator // default 'observer'
// - typeFactory // default ({ props: componentProps }) => `{ ${Object.keys(componentProps).map(key => `${key}: ${componentProps[key] || 'any'};\n`).join('')} }`

function getConfig(options = {}) {
  let fileKey = options.fileKey || process.argv[2] || process.env.FIGMA_FILE_KEY_DEFAULT;
  let devToken = options.devToken || process.argv[3] || process.env.FIGMA_DEV_TOKEN;

  if (!fileKey || !devToken) {
    console.log('Usage: figma-react <file-key> [figma-dev-token] or use env.FIGMA_FILE_KEY_DEFAULT, env.FIGMA_DEV_TOKEN');
    process.exit(0);
  }

  const headers = getHeaders(devToken);

  options.dir = options.dir || process.env.FIGMA_DIR || './src/design-system';

  if (!options.contentPlugins) {
    options.contentPlugins = contentPlugins;
  }

  if (!options.stylePlugins) {
    options.stylePlugins = stylePlugins;
  }

  return {
    headers,
    fileKey
  };
}

async function runFigmaReact(options = {}) {
  const { headers, fileKey } = getConfig(options);

  // Create shared objects
  const vectorMap = {};
  const componentMap = {};
  const componentDescriptionMap = {};
  const vectorList = [];

  const shared = {
    componentMap,
    componentDescriptionMap,
    vectorMap,
    vectorList,
    options
  };

  // Load the document from Figma
  const canvas = await loadCanvas(fileKey, headers);

  // Wrap vectors and images
  preprocessCanvasComponents(canvas, shared);

  // Load component description
  const nodes = await loadNodes(Object.keys(componentDescriptionMap), fileKey, headers);

  for (const id in nodes) {
    componentDescriptionMap[id] = nodes[id].components[id].description;
  }

  // Load all images used in the document from Figma
  const imageJSON = await loadURLImages(vectorList, fileKey, headers);
  const images = await loadImages(imageJSON, fileKey, headers);

  // Debug
  // const fs = require('fs');
  // fs.writeFileSync('./temp.json', JSON.stringify(canvas, null, 4));

  // Create components
  await createComponents(canvas, images, componentMap, componentDescriptionMap, options);

  // Generate components
  for (const key in componentMap) {
    await generateComponent(componentMap[key], options);
  }
}

module.exports = {
  runFigmaReact,
  ...require('./figma.lib'),
  ...require('./figma.api'),
  ...require('./figma.content.plugins'),
  ...require('./figma.style.plugins')
};
